import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types de favoris
export enum FavoriteType {
  OPERATOR = 'operator',
  WEAPON = 'weapon',
  MAP = 'map',
}

// Interface pour un favori
export interface Favorite {
  _id: string;
  userId: string;
  itemType: FavoriteType;
  itemId: string;
  itemName: string;
  metadata?: {
    image?: string;
    type?: string;
    side?: string;
    category?: string;
  };
  createdAt: string;
}

// Interface pour l'état des favoris
interface FavoritesState {
  favorites: Favorite[];
  operators: Favorite[];
  weapons: Favorite[];
  maps: Favorite[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  favorites: [],
  operators: [],
  weapons: [],
  maps: [],
  loading: false,
  error: null,
};

// Helper pour obtenir le token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Thunk pour récupérer tous les favoris
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchAll',
  async (type: FavoriteType | undefined, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('Non authentifié');
      }

      const url = type ? `/api/favorites?type=${type}` : '/api/favorites';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Erreur lors de la récupération des favoris');
      }

      return data;
    } catch {
      return rejectWithValue('Erreur réseau');
    }
  }
);

// Thunk pour toggle un favori
export const toggleFavorite = createAsyncThunk(
  'favorites/toggle',
  async (
    payload: {
      itemType: FavoriteType;
      itemId: string;
      itemName: string;
      metadata?: Favorite['metadata'];
    },
    { rejectWithValue }
  ) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('Non authentifié');
      }

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Erreur lors de la modification du favori');
      }

      return { ...data, ...payload };
    } catch {
      return rejectWithValue('Erreur réseau');
    }
  }
);

// Thunk pour vérifier si un élément est favori
export const checkFavorite = createAsyncThunk(
  'favorites/check',
  async (
    payload: { itemType: FavoriteType; itemId: string },
    { rejectWithValue }
  ) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('Non authentifié');
      }

      const response = await fetch(
        `/api/favorites/check?type=${payload.itemType}&id=${payload.itemId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Erreur lors de la vérification');
      }

      return data;
    } catch {
      return rejectWithValue('Erreur réseau');
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.favorites = [];
      state.operators = [];
      state.weapons = [];
      state.maps = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Ajouter un favori localement (optimistic update)
    addFavoriteLocally: (state, action: PayloadAction<Favorite>) => {
      state.favorites.push(action.payload);
      
      // Ajouter dans la catégorie appropriée
      if (action.payload.itemType === FavoriteType.OPERATOR) {
        state.operators.push(action.payload);
      } else if (action.payload.itemType === FavoriteType.WEAPON) {
        state.weapons.push(action.payload);
      } else if (action.payload.itemType === FavoriteType.MAP) {
        state.maps.push(action.payload);
      }
    },
    // Retirer un favori localement (optimistic update)
    removeFavoriteLocally: (state, action: PayloadAction<{ itemType: FavoriteType; itemId: string }>) => {
      state.favorites = state.favorites.filter(
        f => !(f.itemType === action.payload.itemType && f.itemId === action.payload.itemId)
      );
      
      // Retirer de la catégorie appropriée
      if (action.payload.itemType === FavoriteType.OPERATOR) {
        state.operators = state.operators.filter(f => f.itemId !== action.payload.itemId);
      } else if (action.payload.itemType === FavoriteType.WEAPON) {
        state.weapons = state.weapons.filter(f => f.itemId !== action.payload.itemId);
      } else if (action.payload.itemType === FavoriteType.MAP) {
        state.maps = state.maps.filter(f => f.itemId !== action.payload.itemId);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch favorites
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload.favorites;
        state.operators = action.payload.grouped.operators;
        state.weapons = action.payload.grouped.weapons;
        state.maps = action.payload.grouped.maps;
        state.error = null;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle favorite
    builder
      .addCase(toggleFavorite.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading = false;
        
        const { action: toggleAction, itemType, itemId, favorite } = action.payload;
        
        if (toggleAction === 'added' && favorite) {
          // Ajouter le favori
          state.favorites.push(favorite);
          
          if (itemType === FavoriteType.OPERATOR) {
            state.operators.push(favorite);
          } else if (itemType === FavoriteType.WEAPON) {
            state.weapons.push(favorite);
          } else if (itemType === FavoriteType.MAP) {
            state.maps.push(favorite);
          }
        } else if (toggleAction === 'removed') {
          // Retirer le favori
          state.favorites = state.favorites.filter(
            f => !(f.itemType === itemType && f.itemId === itemId)
          );
          
          if (itemType === FavoriteType.OPERATOR) {
            state.operators = state.operators.filter(f => f.itemId !== itemId);
          } else if (itemType === FavoriteType.WEAPON) {
            state.weapons = state.weapons.filter(f => f.itemId !== itemId);
          } else if (itemType === FavoriteType.MAP) {
            state.maps = state.maps.filter(f => f.itemId !== itemId);
          }
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFavorites, clearError, addFavoriteLocally, removeFavoriteLocally } = favoritesSlice.actions;
export default favoritesSlice.reducer;
