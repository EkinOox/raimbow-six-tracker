import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    // Connexion à la base de données
    await connectDB();

    // Vérifier l'authentification avec NextAuth
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Retourner les informations de l'utilisateur
    return NextResponse.json(
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          uplayProfile: user.uplayProfile,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
