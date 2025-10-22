import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Favorite, { FavoriteType } from '@/models/Favorite';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

/**
 * GET /api/favorites - Récupérer tous les favoris de l'utilisateur connecté
 * Query params optionnels:
 * - type: 'operator' | 'weapon' | 'map' (filtrer par type)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    // Récupérer le type depuis les query params
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');

    let favorites;
    
    if (type && Object.values(FavoriteType).includes(type as FavoriteType)) {
      // Filtrer par type
      favorites = await Favorite.findByUserAndType(decoded.userId, type as FavoriteType);
    } else {
      // Tous les favoris
      favorites = await Favorite.findByUser(decoded.userId);
    }

    // Grouper par type pour faciliter l'affichage
    const groupedFavorites = {
      operators: favorites.filter(f => f.itemType === FavoriteType.OPERATOR),
      weapons: favorites.filter(f => f.itemType === FavoriteType.WEAPON),
      maps: favorites.filter(f => f.itemType === FavoriteType.MAP),
    };

    return NextResponse.json(
      {
        favorites,
        grouped: groupedFavorites,
        count: {
          total: favorites.length,
          operators: groupedFavorites.operators.length,
          weapons: groupedFavorites.weapons.length,
          maps: groupedFavorites.maps.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des favoris:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des favoris', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites - Ajouter/Retirer un favori (toggle)
 * Body: { itemType, itemId, itemName, metadata? }
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    // Récupérer les données du body
    const body = await request.json();
    const { itemType, itemId, itemName, metadata } = body;

    // Validation
    if (!itemType || !itemId || !itemName) {
      return NextResponse.json(
        { error: 'itemType, itemId et itemName sont requis' },
        { status: 400 }
      );
    }

    if (!Object.values(FavoriteType).includes(itemType)) {
      return NextResponse.json(
        { error: 'Type de favori invalide. Valeurs acceptées: operator, weapon, map' },
        { status: 400 }
      );
    }

    // Toggle le favori
    const result = await Favorite.toggleFavorite(
      decoded.userId,
      itemType as FavoriteType,
      itemId,
      itemName,
      metadata
    );

    return NextResponse.json(
      {
        message: result.action === 'added' ? 'Ajouté aux favoris' : 'Retiré des favoris',
        action: result.action,
        favorite: result.favorite,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur lors de la modification du favori:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la modification du favori', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
