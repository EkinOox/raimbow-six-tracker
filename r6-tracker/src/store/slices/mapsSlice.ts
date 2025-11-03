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

// Mapping des cartes avec extensions spéciales (PNG au lieu de JPG)
const MAP_EXTENSIONS: Record<string, string> = {
  'stadium-bravo': 'png',
  'stadium-alpha': 'png',
  'lair': 'png',
  'district': 'png',
};

// Fonction helper pour générer l'URL de l'image d'une carte
function getMapImageUrl(mapName: string): string {
  if (!mapName) return '/images/logo/r6-logo.png';
  
  // Convertir le nom de la carte en nom de fichier
  const fileName = mapName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // Vérifier si cette carte a une extension spéciale
  const extension = MAP_EXTENSIONS[fileName] || 'jpg';
  
  // Retourner l'URL avec la bonne extension
  return `/images/maps/${fileName}.${extension}`;
}

// Thunk pour charger et cacher une image de carte
export const cacheMapImage = createAsyncThunk(
  'maps/cacheMapImage',
  async (mapName: string) => {
    const fileName = mapName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    // Essayer différentes extensions
    const extensions = ['jpg', 'png', 'jpeg', 'webp', 'avif'];
    
    for (const ext of extensions) {
      // Ajouter un timestamp pour éviter le cache du navigateur
      const timestamp = Date.now();
      const imageUrl = `/images/maps/${fileName}.${ext}`;
      
      // Vérifier si l'image existe
      const exists = await new Promise<boolean>((resolve) => {
        const img = new Image();
        
        // Timeout de 5 secondes
        const timeout = setTimeout(() => {
          resolve(false);
        }, 5000);
        
        img.onload = () => {
          clearTimeout(timeout);
          resolve(true);
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };
        
        // Ajouter timestamp pour éviter le cache
        img.src = `${imageUrl}?t=${timestamp}`;
      });
      
      if (exists) {
        // Retourner l'URL sans le timestamp
        return { mapName, imageUrl, exists: true };
      }
    }
    
    // Si aucune image n'est trouvée, utiliser l'image par défaut
    return { mapName, imageUrl: '/images/logo/r6-logo.png', exists: false };
  }
);

// Thunk pour récupérer les maps via notre API serveur
export const fetchMaps = createAsyncThunk('maps/fetchMaps', async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 Récupération des maps depuis notre API serveur...');
    }
    
    const response = await fetch('/api/maps', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'force-cache',
      next: {
        revalidate: 86400
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // Gérer différents formats de réponse
    let mapsArray: Map[] = [];
    if (Array.isArray(data)) {
      mapsArray = data;
    } else if (data.maps && Array.isArray(data.maps)) {
      mapsArray = data.maps;
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('Format de données inattendu pour les cartes:', data);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${data.maps?.length || 0} maps récupérées`);
    }
    
    return { maps: mapsArray };
  });

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
          imageUrl: getMapImageUrl(map.name),
          imageLoaded: true // Considérer comme chargée par défaut
        }));
        state.lastFetch = Date.now();
        state.error = null;
        console.log('✅ Maps chargées dans Redux:', action.payload.maps.length);
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