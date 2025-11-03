import { z } from 'zod';

// Types de favoris supportés
export const favoriteTypeSchema = z.enum(['operator', 'weapon', 'map']);

// Schéma pour ajouter un favori
export const addFavoriteSchema = z.object({
  itemId: z
    .string()
    .min(1, 'L\'ID de l\'élément est requis'),
  itemType: favoriteTypeSchema,
  itemName: z
    .string()
    .min(1, 'Le nom de l\'élément est requis')
    .optional(),
});

// Schéma pour supprimer un favori
export const removeFavoriteSchema = z.object({
  itemId: z.string().min(1, 'L\'ID de l\'élément est requis'),
  itemType: favoriteTypeSchema,
});

// Schéma pour vérifier un favori
export const checkFavoriteSchema = z.object({
  itemId: z.string().min(1, 'L\'ID de l\'élément est requis'),
  itemType: favoriteTypeSchema,
});

// Types inférés
export type FavoriteType = z.infer<typeof favoriteTypeSchema>;
export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
export type RemoveFavoriteInput = z.infer<typeof removeFavoriteSchema>;
export type CheckFavoriteInput = z.infer<typeof checkFavoriteSchema>;
