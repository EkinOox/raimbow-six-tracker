import { z } from 'zod';

// Schéma pour l'inscription
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'),
  email: z
    .string()
    .email('Adresse email invalide')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  uplayProfile: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
});

// Schéma pour la connexion
export const loginSchema = z.object({
  email: z
    .string()
    .email('Adresse email invalide')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
});

// Schéma pour la mise à jour du profil
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores')
    .optional(),
  avatar: z
    .string()
    .url('URL d\'avatar invalide')
    .optional()
    .or(z.literal('')),
  uplayProfile: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
});

// Types inférés des schémas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
