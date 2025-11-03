import { z } from 'zod';

// Plateformes supportées
export const platformSchema = z.enum(['uplay', 'pc', 'playstation', 'psn', 'xbox', 'xbl']);

// Familles de plateformes
export const platformFamilySchema = z.enum(['pc', 'console']);

// Actions API R6
export const r6ActionSchema = z.enum([
  'getServiceStatus',
  'getId',
  'getStats',
  'getAccountInfo',
  'getPlayerStats',
]);

// Schéma pour getAccountInfo
export const getAccountInfoSchema = z.object({
  action: z.literal('getAccountInfo'),
  nameOnPlatform: z
    .string()
    .min(1, 'Le nom du joueur est requis')
    .max(50, 'Le nom du joueur est trop long'),
  platformType: platformSchema,
});

// Schéma pour getPlayerStats
export const getPlayerStatsSchema = z.object({
  action: z.literal('getPlayerStats'),
  nameOnPlatform: z
    .string()
    .min(1, 'Le nom du joueur est requis')
    .max(50, 'Le nom du joueur est trop long'),
  platformType: platformSchema,
  platform_families: platformFamilySchema,
});

// Schéma pour getId
export const getIdSchema = z.object({
  action: z.literal('getId'),
  params: z.object({
    platform: platformSchema,
    username: z
      .string()
      .min(1, 'Le nom d\'utilisateur est requis')
      .max(50, 'Le nom d\'utilisateur est trop long'),
  }),
});

// Schéma pour getStats
export const getStatsSchema = z.object({
  action: z.literal('getStats'),
  params: z.object({
    platform: platformSchema,
    playerId: z.string().uuid('ID de joueur invalide'),
  }),
});

// Schéma pour getServiceStatus
export const getServiceStatusSchema = z.object({
  action: z.literal('getServiceStatus'),
});

// Union de tous les schémas R6
export const r6ProxyRequestSchema = z.discriminatedUnion('action', [
  getServiceStatusSchema,
  getIdSchema,
  getStatsSchema,
  getAccountInfoSchema,
  getPlayerStatsSchema,
]);

// Types inférés
export type Platform = z.infer<typeof platformSchema>;
export type PlatformFamily = z.infer<typeof platformFamilySchema>;
export type R6Action = z.infer<typeof r6ActionSchema>;
export type GetAccountInfoInput = z.infer<typeof getAccountInfoSchema>;
export type GetPlayerStatsInput = z.infer<typeof getPlayerStatsSchema>;
export type GetIdInput = z.infer<typeof getIdSchema>;
export type GetStatsInput = z.infer<typeof getStatsSchema>;
export type R6ProxyRequest = z.infer<typeof r6ProxyRequestSchema>;
