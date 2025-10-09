import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Weapon, WeaponFilters, ApiState } from '../../types/r6-api-types';

// Durée de cache en millisecondes (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

// État initial
const initialState: ApiState<Weapon> = {
  data: [],
  loading: false,
  error: null,
  lastFetch: null,
  filters: {}
};

// Thunk pour récupérer les armes depuis l'API
export const fetchWeapons = createAsyncThunk(
  'weapons/fetchWeapons',
  async (filters: WeaponFilters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { weapons: ApiState<Weapon> };
      const now = Date.now();
      
      // Vérifier si les données sont encore valides (cache)
      if (
        state.weapons.data.length > 0 && 
        state.weapons.lastFetch && 
        (now - state.weapons.lastFetch) < CACHE_DURATION &&
        JSON.stringify(state.weapons.filters) === JSON.stringify(filters)
      ) {
        console.log('🎯 Utilisation du cache pour les armes');
        return { data: state.weapons.data, fromCache: true };
      }

      console.log('🌐 Récupération des armes depuis l\'API...');
      
      // Construire l'URL avec les filtres
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const url = `https://r6-api.vercel.app/api/weapons${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`✅ ${data.length} armes récupérées`);
      
      return { data, fromCache: false };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des armes:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }
);

// Slice Redux
const weaponsSlice = createSlice({
  name: 'weapons',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<WeaponFilters>) => {
      state.filters = action.payload as Record<string, unknown>;
    },
    clearWeapons: (state) => {
      state.data = [];
      state.lastFetch = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeapons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeapons.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.lastFetch = action.payload.fromCache ? state.lastFetch : Date.now();
        state.filters = action.meta.arg as Record<string, unknown>;
        state.error = null;
      })
      .addCase(fetchWeapons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, clearWeapons, clearError } = weaponsSlice.actions;
export default weaponsSlice.reducer;