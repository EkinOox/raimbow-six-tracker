import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';

// Ne pas lever d'erreur à l'import : vérifier la présence du secret au moment
// où on en a réellement besoin (sign / verify). Cela évite d'échouer lors du
// build/collecting de Next.js qui importe les modules pour l'analyse.
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

/**
 * Générer un token JWT pour un utilisateur
 */
export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
  };

  if (!JWT_SECRET) {
    throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
}

/**
 * Vérifier et décoder un token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not defined; skipping token verification');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  }
}

/**
 * Extraire le token depuis les headers de la requête
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  // Format attendu: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Décoder un token sans vérification (pour débug uniquement)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    console.error('Erreur de décodage du token:', error);
    return null;
  }
}
