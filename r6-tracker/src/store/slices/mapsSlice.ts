import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Map, MapFilters, ApiState } from '../../types/r6-api-types';

// Durée de cache en millisecondes (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

// État initial
const initialState: ApiState<Map> = {
  data: [],
  loading: false,
  error: null,
  lastFetch: null,
  filters: {}
};

// Thunk pour récupérer les maps depuis l'API
export const fetchMaps = createAsyncThunk(
  'maps/fetchMaps',
  async (filters: MapFilters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { maps: ApiState<Map> };
      const now = Date.now();
      
      // Vérifier si les données sont encore valides (cache)
      if (
        state.maps.data.length > 0 && 
        state.maps.lastFetch && 
        (now - state.maps.lastFetch) < CACHE_DURATION &&
        JSON.stringify(state.maps.filters) === JSON.stringify(filters)
      ) {
        console.log('🎯 Utilisation du cache pour les maps');
        return { data: state.maps.data, fromCache: true };
      }

      console.log('🌐 Récupération des maps depuis l\'API...');
      
      // Construire l'URL avec les filtres
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const url = `https://r6-api.vercel.app/api/maps${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`✅ ${data.length} maps récupérées`);
      
      return { data, fromCache: false };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des maps:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }
);

// Slice Redux
const mapsSlice = createSlice({
  name: 'maps',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<MapFilters>) => {
      state.filters = action.payload as Record<string, unknown>;
    },
    clearMaps: (state) => {
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
      .addCase(fetchMaps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaps.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.lastFetch = action.payload.fromCache ? state.lastFetch : Date.now();
        state.filters = action.meta.arg as Record<string, unknown>;
        state.error = null;
      })
      .addCase(fetchMaps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, clearMaps, clearError } = mapsSlice.actions;
export default mapsSlice.reducer;