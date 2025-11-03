import { validateClientData } from './validation';
import type { 
  LoginInput, 
  RegisterInput, 
  UpdateProfileInput 
} from '@/schemas/auth.schema';
import type {
  GetAccountInfoInput,
  GetPlayerStatsInput,
} from '@/schemas/r6.schema';
import type {
  AddFavoriteInput,
  RemoveFavoriteInput,
  CheckFavoriteInput,
} from '@/schemas/favorites.schema';
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '@/schemas/auth.schema';
import {
  getAccountInfoSchema,
  getPlayerStatsSchema,
} from '@/schemas/r6.schema';
import {
  addFavoriteSchema,
  removeFavoriteSchema,
  checkFavoriteSchema,
} from '@/schemas/favorites.schema';

// Type pour les erreurs de validation
export interface ValidationErrors {
  [key: string]: string[];
}

// Type pour les réponses d'erreur
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: ValidationErrors;
  validationErrors?: ValidationErrors;
}

// Type pour les réponses de succès
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  [key: string]: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Wrapper pour les appels fetch avec gestion d'erreurs
 */
async function fetchWithValidation<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Une erreur est survenue',
        details: data.details,
        validationErrors: data.details,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur réseau',
    };
  }
}

/**
 * API Client pour l'authentification
 */
export const authApi = {
  /**
   * Connexion
   */
  async login(input: LoginInput): Promise<ApiResponse> {
    const validation = validateClientData(loginSchema, input);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Erreur de validation',
        validationErrors: validation.errors,
      };
    }

    return fetchWithValidation('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    });
  },

  /**
   * Inscription
   */
  async register(input: RegisterInput): Promise<ApiResponse> {
    const validation = validateClientData(registerSchema, input);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Erreur de validation',
        validationErrors: validation.errors,
      };
    }

    return fetchWithValidation('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    });
  },

  /**
   * Mise à jour du profil
   */
  async updateProfile(input: UpdateProfileInput, token: string): Promise<ApiResponse> {
    const validation = validateClientData(updateProfileSchema, input);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Erreur de validation',
        validationErrors: validation.errors,
      };
    }

    return fetchWithValidation('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(validation.data),
    });
  },

  /**
   * Récupérer le profil utilisateur
   */
  async getProfile(token: string): Promise<ApiResponse> {
    return fetchWithValidation('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

/**
 * API Client pour R6
 */
export const r6Api = {
  /**
   * Récupérer les informations du compte
   */
  async getAccountInfo(input: GetAccountInfoInput): Promise<ApiResponse> {
    const validation = validateClientData(getAccountInfoSchema, input);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Erreur de validation',
        validationErrors: validation.errors,
      };
    }

    return fetchWithValidation('/api/r6-data-proxy', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    });
  },

  /**
   * Récupérer les statistiques du joueur
   */
  async getPlayerStats(input: GetPlayerStatsInput): Promise<ApiResponse> {
    const validation = validateClientData(getPlayerStatsSchema, input);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Erreur de validation',
        validationErrors: validation.errors,
      };
    }

    return fetchWithValidation('/api/r6-data-proxy', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    });
  },
};

/**
 * API Client pour les favoris
 */
export const favoritesApi = {
  /**
   * Ajouter un favori
   */
  async add(input: AddFavoriteInput, token: string): Promise<ApiResponse> {
    const validation = validateClientData(addFavoriteSchema, input);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Erreur de validation',
        validationErrors: validation.errors,
      };
    }

    return fetchWithValidation('/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(validation.data),
    });
  },

  /**
   * Supprimer un favori
   */
  async remove(input: RemoveFavoriteInput, token: string): Promise<ApiResponse> {
    const validation = validateClientData(removeFavoriteSchema, input);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Erreur de validation',
        validationErrors: validation.errors,
      };
    }

    return fetchWithValidation('/api/favorites', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(validation.data),
    });
  },

  /**
   * Vérifier si un élément est favori
   */
  async check(input: CheckFavoriteInput, token: string): Promise<ApiResponse> {
    const validation = validateClientData(checkFavoriteSchema, input);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Erreur de validation',
        validationErrors: validation.errors,
      };
    }

    const params = new URLSearchParams({
      itemId: validation.data.itemId,
      itemType: validation.data.itemType,
    });

    return fetchWithValidation(`/api/favorites/check?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Récupérer tous les favoris
   */
  async getAll(token: string): Promise<ApiResponse> {
    return fetchWithValidation('/api/favorites', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};
