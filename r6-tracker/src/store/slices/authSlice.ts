import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Interface pour l'utilisateur
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  uplayProfile?: string;
  createdAt: string;
}

// Interface pour l'état d'authentification
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Thunk pour l'inscription
export const register = createAsyncThunk(
  'auth/register',
  async (credentials: { username: string; email: string; password: string; uplayProfile?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Erreur lors de l\'inscription');
      }

      // Stocker le token dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }

      return data;
    } catch {
      return rejectWithValue('Erreur réseau lors de l\'inscription');
    }
  }
);

// Thunk pour la connexion
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Erreur lors de la connexion');
      }

      // Stocker le token dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }

      return data;
    } catch {
      return rejectWithValue('Erreur réseau lors de la connexion');
    }
  }
);

// Thunk pour récupérer le profil utilisateur
export const getMe = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        return rejectWithValue('Aucun token trouvé');
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Erreur lors de la récupération du profil');
      }

      return data;
    } catch {
      return rejectWithValue('Erreur réseau');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Supprimer le token du localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload);
      }
    },
    // Nouvelle action pour restaurer le token depuis localStorage
    restoreToken: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          state.token = token;
          // Note: isAuthenticated sera mis à true par getMe() si le token est valide
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Me
    builder
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
        
        // Supprimer le token invalide
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      });
  },
});

export const { logout, clearError, setToken, restoreToken } = authSlice.actions;
export default authSlice.reducer;
