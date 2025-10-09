// Service principal pour l'application R6 Tracker
// Utilise uniquement les APIs Next.js internes pour éviter les problèmes CORS

const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000');
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

// API pour récupérer les opérateurs
export const getOperators = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/operators`, {
      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Erreur API operators: ${response.status}`);
    }

    const data = await response.json();
    return data.operators || data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des opérateurs:', error);
    throw error;
  }
};

// API pour récupérer les cartes
export const getMaps = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/maps`, {
      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Erreur API maps: ${response.status}`);
    }

    const data = await response.json();
    return data.maps || data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des cartes:', error);
    throw error;
  }
};

// API pour récupérer les armes
export const getWeapons = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weapons`, {
      headers: { 'User-Agent': 'R6-Tracker-App/1.0' },
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Erreur API weapons: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des armes:', error);
    throw error;
  }
};

// API pour récupérer les informations du compte via le proxy r6-data
export const getAccountInfo = async (username: string, platform: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/r6-data-proxy`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'R6-Tracker-App/1.0' 
      },
      body: JSON.stringify({
        action: 'getAccountInfo',
        params: {
          nameOnPlatform: username,
          platformType: platform
        }
      }),
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Erreur API account info: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération des informations du compte');
    }

    return result.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des informations du compte:', error);
    throw error;
  }
};

// API pour récupérer les statistiques du joueur via le proxy r6-data
export const getPlayerStats = async (username: string, platform: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/r6-data-proxy`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'R6-Tracker-App/1.0' 
      },
      body: JSON.stringify({
        action: 'getPlayerStats',
        params: {
          nameOnPlatform: username,
          platformType: platform,
          platform_families: ['pc', 'console']
        }
      }),
      signal: AbortSignal.timeout(API_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Erreur API player stats: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de la récupération des statistiques du joueur');
    }

    return result.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques du joueur:', error);
    throw error;
  }
};

// Service de validation pour les noms d'utilisateur
export const validateUsername = (username: string) => {
  const isValid = username && username.trim().length >= 3 && username.trim().length <= 15;
  return { 
    isValid,
    error: !isValid ? 'Le nom d\'utilisateur doit contenir entre 3 et 15 caractères' : undefined
  };
};

// Service de test de connexion
export const testConnection = async (): Promise<boolean> => {
  try {
    // Test simple avec l'API des opérateurs
    const response = await fetch(`${API_BASE_URL}/api/operators`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Test de connexion échoué:', error);
    return false;
  }
};

// Export par défaut pour compatibilité
const r6DataService = {
  getOperators,
  getMaps,
  getWeapons,
  getAccountInfo,
  getPlayerStats,
  validateUsername,
  testConnection
};

export default r6DataService;
