// Types pour les opérateurs R6
export interface Operator {
  name: string;
  safename: string;
  realname: string;
  birthplace: string;
  age: string;
  date_of_birth: string;
  season_introduced: string;
  health: number;
  speed: string;
  unit: string;
  country_code: string;
  roles: string[];
  side: 'attacker' | 'defender';
  icon_url: string;
}

// Type étendu pour les détails d'opérateur (avec données potentiellement enrichies)
export interface OperatorDetail extends Operator {
  image_url?: string;
  iconUrl?: string;
  country?: string;
  armor?: number;
  uniqueAbility?: {
    name: string;
    description: string;
    iconUrl?: string;
  };
  abilities?: Array<{
    name: string;
    description: string;
    iconUrl?: string;
  }>;
  weapons?: {
    primary?: Array<{
      name: string;
      type: string;
      damage: number;
      fireRate: number;
      capacity: number;
      imageUrl?: string;
    }>;
    secondary?: Array<{
      name: string;
      type: string;
      damage: number;
      fireRate: number;
      capacity: number;
      imageUrl?: string;
    }>;
  };
}

// Types pour les armes R6
export interface Weapon {
  name: string;
  type: string;
  damage: number;
  fireRate: number;
  mobility: number;
  capacity: number;
  class: string;
  availableFor: string[];
  image_url?: string;
  family?: string;
  operators?: string[];
}

// Types pour les maps R6
export interface Map {
  name: string;
  location: string;
  releaseDate: string;
  playlists: string;
  mapReworked?: string;
  image_url?: string;
  imageUrl?: string; // URL de l'image mise en cache
  imageLoaded?: boolean; // Statut de chargement de l'image
}

// Types pour les filtres
export interface OperatorFilters {
  name?: string;
  realname?: string;
  birthplace?: string;
  roles?: string;
  side?: string;
  health?: number;
}

export interface WeaponFilters {
  name?: string;
  type?: string;
  family?: string;
}

export interface MapFilters {
  name?: string;
  location?: string;
  playlists?: string;
  releaseDate?: string;
}

// Types pour l'état Redux
export interface ApiState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  filters: Record<string, unknown>;
}

export interface RootState {
  operators: ApiState<Operator>;
  weapons: ApiState<Weapon>;
  maps: ApiState<Map>;
}