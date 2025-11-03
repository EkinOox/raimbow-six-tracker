import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Récupérer le token depuis les headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json(
        { message: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    // Récupérer le corps de la requête
    const body = await request.json();
    const { username, avatar, uplayProfile } = body;

    // Trouver l'utilisateur actuel
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Validation et mise à jour du nom d'utilisateur
    if (username !== undefined) {
      if (!username || username.trim().length === 0) {
        return NextResponse.json(
          { message: 'Le nom d\'utilisateur ne peut pas être vide' },
          { status: 400 }
        );
      }

      if (username !== user.username) {
        // Vérifier si le nouveau nom d'utilisateur est déjà pris
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
          return NextResponse.json(
            { message: 'Ce nom d\'utilisateur est déjà utilisé' },
            { status: 409 }
          );
        }
        user.username = username;
      }
    }

    // Mise à jour de l'avatar
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    // Validation et mise à jour du profil Uplay
    if (uplayProfile !== undefined) {
      // Permettre de supprimer le profil Uplay (null ou chaîne vide)
      if (!uplayProfile || uplayProfile.trim().length === 0) {
        user.uplayProfile = undefined;
      } else {
        // Vérifier si le profil Uplay est déjà utilisé par un autre utilisateur
        if (uplayProfile !== user.uplayProfile) {
          const existingProfile = await User.findByUplayProfile(uplayProfile);
          if (existingProfile && existingProfile._id.toString() !== user._id.toString()) {
            return NextResponse.json(
              { message: 'Ce profil Uplay est déjà lié à un autre compte' },
              { status: 409 }
            );
          }
          user.uplayProfile = uplayProfile.trim();
        }
      }
    }

    // Sauvegarder les modifications
    await user.save();

    // Retourner l'utilisateur mis à jour (sans le mot de passe)
    return NextResponse.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        uplayProfile: user.uplayProfile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

  } catch (error: unknown) {
    console.error('Erreur lors de la mise à jour du profil:', error);

    // Gestion des erreurs de duplication MongoDB
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      const mongoError = error as { keyPattern?: Record<string, number> };
      const field = Object.keys(mongoError.keyPattern || {})[0];
      if (field === 'uplayProfile') {
        return NextResponse.json(
          { message: 'Ce profil Uplay est déjà lié à un autre compte' },
          { status: 409 }
        );
      } else if (field === 'username') {
        return NextResponse.json(
          { message: 'Ce nom d\'utilisateur est déjà utilisé' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Erreur serveur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}
