import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Connexion à la base de données
    await connectDB();

    // Récupérer les données du corps de la requête
    const body = await request.json();
    const { email, password } = body;

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur par email (en incluant le mot de passe)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Générer un token JWT
    const token = generateToken(user);

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    return NextResponse.json(
      {
        message: 'Connexion réussie',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          uplayProfile: user.uplayProfile,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la connexion', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
