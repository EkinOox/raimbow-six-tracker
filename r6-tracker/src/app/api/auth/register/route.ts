import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { registerSchema } from '@/schemas/auth.schema';
import { validateData } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Connexion à la base de données
    await connectDB();

    // Récupérer et valider les données
    const body = await request.json();
    const validation = validateData(registerSchema, body);
    
    if (!validation.success) {
      return validation.response;
    }
    
    const { username, email, password, uplayProfile } = validation.data;

    // Vérifier si l'email existe déjà
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur est déjà utilisé' },
        { status: 409 }
      );
    }

    // Créer le nouvel utilisateur avec new User() pour que le middleware pre-save fonctionne
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password, // Le mot de passe sera hashé automatiquement par le middleware pre-save
      uplayProfile: uplayProfile || null,
    });
    
    await newUser.save(); // Déclenche le middleware pre-save qui hash le password

    // Générer un token JWT
    const token = generateToken(newUser);

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    return NextResponse.json(
      {
        message: 'Utilisateur créé avec succès',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          avatar: newUser.avatar,
          uplayProfile: newUser.uplayProfile,
          createdAt: newUser.createdAt,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);

    // Gérer les erreurs de validation Mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Erreur de validation', details: error.message },
        { status: 400 }
      );
    }

    // Gérer les erreurs de duplication (index unique)
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Email ou nom d\'utilisateur déjà utilisé' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du compte', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
