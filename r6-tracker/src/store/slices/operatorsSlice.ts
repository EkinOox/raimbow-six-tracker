import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Operator, OperatorFilters, ApiState } from '../../types/r6-api-types';

// Durée de cache en millisecondes (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

// État initial
const initialState: ApiState<Operator> = {
  data: [],
  loading: false,
  error: null,
  lastFetch: null,
  filters: {}
};

// Thunk pour récupérer les opérateurs depuis l'API
export const fetchOperators = createAsyncThunk(
  'operators/fetchOperators',
  async (filters: OperatorFilters = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { operators: ApiState<Operator> };
      const now = Date.now();
      
      // Vérifier si les données sont encore valides (cache)
      if (
        state.operators.data.length > 0 && 
        state.operators.lastFetch && 
        (now - state.operators.lastFetch) < CACHE_DURATION &&
        JSON.stringify(state.operators.filters) === JSON.stringify(filters)
      ) {
        console.log('🎯 Utilisation du cache pour les opérateurs');
        return { data: state.operators.data, fromCache: true };
      }

      console.log('🌐 Récupération des opérateurs depuis l\'API...');
      
      // Construire l'URL avec les filtres
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const url = `https://r6-api.vercel.app/api/operators${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`✅ ${data.length} opérateurs récupérés`);
      
      return { data, fromCache: false };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des opérateurs:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }
);

// Slice Redux
const operatorsSlice = createSlice({
  name: 'operators',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<OperatorFilters>) => {
      state.filters = action.payload as Record<string, unknown>;
    },
    clearOperators: (state) => {
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
      .addCase(fetchOperators.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOperators.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.lastFetch = action.payload.fromCache ? state.lastFetch : Date.now();
        state.filters = action.meta.arg as Record<string, unknown>;
        state.error = null;
      })
      .addCase(fetchOperators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, clearOperators, clearError } = operatorsSlice.actions;
export default operatorsSlice.reducer;