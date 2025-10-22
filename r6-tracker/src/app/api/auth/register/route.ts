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
    const { username, email, password, uplayProfile } = body;

    // Validation des données
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis (username, email, password)' },
        { status: 400 }
      );
    }

    // Validation du format email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Validation du nom d'utilisateur
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username) || username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'Le nom d\'utilisateur doit contenir entre 3 et 30 caractères (lettres, chiffres, tirets et underscores uniquement)' },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

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

    // Créer le nouvel utilisateur
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      password, // Le mot de passe sera hashé automatiquement par le middleware
      uplayProfile: uplayProfile || null,
    });

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
