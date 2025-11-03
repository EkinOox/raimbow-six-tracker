import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Operator, OperatorFilters } from '../../types/r6-api-types';

interface OperatorsState {
  operators: Operator[];
  loading: boolean;
  error: string | null;
  filters: OperatorFilters;
  lastFetch: number | null;
  cacheExpiry: number;
}

const initialState: OperatorsState = {
  operators: [],
  loading: false,
  error: null,
  filters: {},
  lastFetch: null,
  cacheExpiry: 30 * 60 * 1000, // 30 minutes en millisecondes
};

// Thunk pour récupérer les opérateurs via notre API serveur
export const fetchOperators = createAsyncThunk(
  'operators/fetchOperators',
  async (filters: OperatorFilters = {}) => {
    console.log('🌐 Récupération des opérateurs depuis notre API serveur...');
    
    // Construire l'URL avec les filtres
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const url = `/api/operators${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    console.log(`✅ ${data.operators?.length || 0} opérateurs récupérés`);
    
    return {
      operators: data.operators || [],
      count: data.count || 0,
      cached: data.cached || false
    };
  }
);

const operatorsSlice = createSlice({
  name: 'operators',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<OperatorFilters>) => {
      state.filters = action.payload;
    },
    clearOperators: (state) => {
      state.operators = [];
      state.lastFetch = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperators.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOperators.fulfilled, (state, action) => {
        state.loading = false;
        state.operators = action.payload.operators;
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Opérateurs chargés dans Redux:', action.payload.operators.length);
        }
      })
      .addCase(fetchOperators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des opérateurs';
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Erreur chargement opérateurs:', action.error.message);
        }
      });
  },
});

export const { setFilters, clearOperators, clearError } = operatorsSlice.actions;
export default operatorsSlice.reducer;