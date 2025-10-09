import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Map, MapFilters } from '../../types/r6-api-types';

interface MapsState {
  maps: Map[];
  loading: boolean;
  error: string | null;
  filters: MapFilters;
  lastFetch: number | null;
  cacheExpiry: number;
}

const initialState: MapsState = {
  maps: [],
  loading: false,
  error: null,
  filters: {},
  lastFetch: null,
  cacheExpiry: 30 * 60 * 1000, // 30 minutes en millisecondes
};

// Thunk pour récupérer les maps via notre API serveur
export const fetchMaps = createAsyncThunk(
  'maps/fetchMaps',
  async (filters: MapFilters = {}) => {
    console.log('🌐 Récupération des maps depuis notre API serveur...');
    
    // Construire l'URL avec les filtres
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const url = `/api/maps${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    console.log(`✅ ${data.maps?.length || 0} maps récupérées`);
    
    return {
      maps: data.maps || [],
      count: data.count || 0,
      cached: data.cached || false
    };
  }
);

const mapsSlice = createSlice({
  name: 'maps',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<MapFilters>) => {
      state.filters = action.payload;
    },
    clearMaps: (state) => {
      state.maps = [];
      state.lastFetch = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaps.fulfilled, (state, action) => {
        state.loading = false;
        state.maps = action.payload.maps;
        state.lastFetch = Date.now();
        state.error = null;
        console.log('✅ Maps chargées dans Redux:', action.payload.maps.length);
      })
      .addCase(fetchMaps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des maps';
        console.error('❌ Erreur chargement maps:', action.error.message);
      });
  },
});

export const { setFilters, clearMaps, clearError } = mapsSlice.actions;
export default mapsSlice.reducer;