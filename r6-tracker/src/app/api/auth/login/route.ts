import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { loginSchema } from '@/schemas/auth.schema';
import { validateData } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Connexion à la base de données
    await connectDB();

    // Récupérer et valider les données
    const body = await request.json();
    const validation = validateData(loginSchema, body);
    
    if (!validation.success) {
      return validation.response;
    }
    
    const { email, password } = validation.data;

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
