import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Weapon, WeaponFilters } from '../../types/r6-api-types';

interface WeaponsState {
  weapons: Weapon[];
  loading: boolean;
  error: string | null;
  filters: WeaponFilters;
  lastFetch: number | null;
  cacheExpiry: number;
}

const initialState: WeaponsState = {
  weapons: [],
  loading: false,
  error: null,
  filters: {},
  lastFetch: null,
  cacheExpiry: 30 * 60 * 1000, // 30 minutes en millisecondes
};

// Thunk pour récupérer les weapons via notre API serveur
export const fetchWeapons = createAsyncThunk(
  'weapons/fetchWeapons',
  async (filters: WeaponFilters = {}) => {
    console.log('🌐 Récupération des weapons depuis notre API serveur...');
    
    // Construire l'URL avec les filtres
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const url = `/api/weapons${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Vérifier si c'est une erreur
    if (data.error) {
      throw new Error(data.message || data.error);
    }
    
    // L'API retourne directement un tableau d'armes
    const weaponsArray = Array.isArray(data) ? data : [];
    
    console.log(`✅ ${weaponsArray.length} weapons récupérées`);
    
    return {
      weapons: weaponsArray,
      count: weaponsArray.length,
      cached: false
    };
  }
);

const weaponsSlice = createSlice({
  name: 'weapons',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<WeaponFilters>) => {
      state.filters = action.payload;
    },
    clearWeapons: (state) => {
      state.weapons = [];
      state.lastFetch = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeapons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeapons.fulfilled, (state, action) => {
        state.loading = false;
        state.weapons = action.payload.weapons;
        state.lastFetch = Date.now();
        state.error = null;
        console.log('✅ Weapons chargées dans Redux:', action.payload.weapons.length);
      })
      .addCase(fetchWeapons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des weapons';
        console.error('❌ Erreur chargement weapons:', action.error.message);
      });
  },
});

export const { setFilters, clearWeapons, clearError } = weaponsSlice.actions;
export default weaponsSlice.reducer;