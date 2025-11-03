import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Favorite, { FavoriteType } from '@/models/Favorite';
import { auth } from '@/lib/auth';

/**
 * GET /api/favorites/check?type=operator&id=ash
 * Vérifier si un élément spécifique est en favori
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Vérifier l'authentification avec NextAuth
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Récupérer les paramètres
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Les paramètres type et id sont requis' },
        { status: 400 }
      );
    }

    if (!Object.values(FavoriteType).includes(type as FavoriteType)) {
      return NextResponse.json(
        { error: 'Type de favori invalide' },
        { status: 400 }
      );
    }

    // Vérifier si c'est un favori
    const isFavorite = await Favorite.isFavorite(
      userId,
      type as FavoriteType,
      id
    );

    return NextResponse.json(
      {
        isFavorite,
        itemType: type,
        itemId: id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du favori:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la vérification', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites/check
 * Vérifier si un élément spécifique est en favori (via body)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Vérifier l'authentification avec NextAuth
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Récupérer les données du body
    const body = await request.json();
    const { itemType, itemId } = body;

    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: 'Les paramètres itemType et itemId sont requis' },
        { status: 400 }
      );
    }

    if (!Object.values(FavoriteType).includes(itemType as FavoriteType)) {
      return NextResponse.json(
        { error: 'Type de favori invalide' },
        { status: 400 }
      );
    }

    // Vérifier si c'est un favori
    const isFavorite = await Favorite.isFavorite(
      userId,
      itemType as FavoriteType,
      itemId
    );

    return NextResponse.json(
      {
        isFavorite,
        itemType,
        itemId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du favori:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la vérification', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
