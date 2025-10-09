import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Map, MapFilters } from '../../types/r6-api-types';

interface MapWithImage extends Map {
  imageUrl?: string; // URL de l'image mise en cache
  imageLoaded?: boolean; // Statut de chargement de l'image
}

interface MapsState {
  maps: MapWithImage[];
  loading: boolean;
  error: string | null;
  filters: MapFilters;
  lastFetch: number | null;
  cacheExpiry: number;
  imageCache: Record<string, string>; // Cache des URLs d'images par nom de carte
}

const initialState: MapsState = {
  maps: [],
  loading: false,
  error: null,
  filters: {},
  lastFetch: null,
  cacheExpiry: 30 * 60 * 1000, // 30 minutes en millisecondes
  imageCache: {}, // Cache des images
};

// Fonction helper pour générer l'URL de l'image d'une carte
function getMapImageUrl(mapName: string): string {
  if (!mapName) return '/images/logo/r6-logo.png';
  
  // Convertir le nom de la carte en nom de fichier
  const fileName = mapName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  return `/images/maps/${fileName}.jpg`;
}

// Thunk pour charger et cacher une image de carte
export const cacheMapImage = createAsyncThunk(
  'maps/cacheMapImage',
  async (mapName: string) => {
    const imageUrl = getMapImageUrl(mapName);
    
    // Vérifier si l'image existe en tentant de la charger
    return new Promise<{ mapName: string; imageUrl: string; exists: boolean }>((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({ mapName, imageUrl, exists: true });
      };
      
      img.onerror = () => {
        resolve({ mapName, imageUrl: '/images/logo/r6-logo.png', exists: false });
      };
      
      img.src = imageUrl;
    });
  }
);

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
    clearImageCache: (state) => {
      state.imageCache = {};
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
        // Enrichir chaque carte avec son URL d'image
        state.maps = action.payload.maps.map((map: Map) => ({
          ...map,
          imageUrl: state.imageCache[map.name] || getMapImageUrl(map.name),
          imageLoaded: !!state.imageCache[map.name]
        }));
        state.lastFetch = Date.now();
        state.error = null;
        console.log('✅ Maps chargées dans Redux:', action.payload.maps.length);
        
        // Charger les images en cache pour toutes les cartes
        action.payload.maps.forEach((map: Map) => {
          if (!state.imageCache[map.name]) {
            // Note: dispatch sera appelé depuis le hook
          }
        });
      })
      .addCase(fetchMaps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des maps';
        console.error('❌ Erreur chargement maps:', action.error.message);
      })
      .addCase(cacheMapImage.fulfilled, (state, action) => {
        const { mapName, imageUrl } = action.payload;
        state.imageCache[mapName] = imageUrl;
        
        // Mettre à jour la carte correspondante
        const mapIndex = state.maps.findIndex(map => map.name === mapName);
        if (mapIndex !== -1) {
          state.maps[mapIndex].imageUrl = imageUrl;
          state.maps[mapIndex].imageLoaded = true;
        }
      });
  },
});

export const { setFilters, clearMaps, clearError, clearImageCache } = mapsSlice.actions;
export default mapsSlice.reducer;