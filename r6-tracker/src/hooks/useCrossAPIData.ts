import { useState, useMemo, useCallback } from 'react';
import { useOperators, useWeapons, useMaps } from './useR6Data';
import type { Operator, Weapon, Map } from '../types/r6-api-types';

// Interface pour les données croisées d'un opérateur enrichi
export interface EnrichedOperator extends Operator {
  weapons?: Weapon[];
  favoriteMap?: Map;
  winRateOnMaps?: { mapName: string; winRate: number }[];
  weaponTypes: string[];
  weaponCount: number;
  averageWeaponDamage: number;
  hasUniqueWeapon: boolean;
  synergies?: {
    bestWeapons: Weapon[];
    recommendedMaps: Map[];
    counterOperators: Operator[];
  };
}

// Interface pour les armes enrichies
export interface EnrichedWeapon extends Weapon {
  operators?: Operator[];
  effectivenessScore?: number;
  family?: string;
  availableFor?: string[];
}

// Interface pour les cartes enrichies
export interface EnrichedMap extends Map {
  bestOperators?: {
    attackers: Operator[];
    defenders: Operator[];
  };
  strategies?: {
    attack: string[];
    defense: string[];
  };
}

// Interface pour les filtres croisés
export interface CrossAPIFilters {
  searchTerm?: string;
  operatorRole?: string;
  operatorSide?: string;
  operatorSpeed?: string;
  operatorHealth?: number;
  operatorUnit?: string;
  operatorCountry?: string;
  operatorSeason?: string;
  operatorWeaponCompatibility?: boolean;
  weaponType?: string;
  weaponMinDamage?: number;
  weaponMaxDamage?: number;
  weaponClass?: string;
  hasSpecificWeapon?: string;
  mapType?: string;
  mapSize?: string;
}

// Interface pour les données filtrées
export interface FilteredData {
  operators: EnrichedOperator[];
  weapons: EnrichedWeapon[];
  maps: EnrichedMap[];
}

// Interface pour les statistiques
export interface CrossAPIStats {
  totalOperators: number;
  totalWeapons: number;
  totalMaps: number;
  avgOperatorHealth: number;
  avgWeaponDamage: number;
  mostCommonSpeed: string;
  mostCommonWeaponType: string;
}

export function useCrossAPIData() {
  // Hooks pour récupérer les données de base
  const { operators, loading: operatorsLoading, error: operatorsError } = useOperators();
  const { weapons, loading: weaponsLoading, error: weaponsError } = useWeapons();
  const { maps, loading: mapsLoading, error: mapsError } = useMaps();

  // États pour les filtres et l'analyse
  const [filters, setFilters] = useState<CrossAPIFilters>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // États de chargement et d'erreur combinés
  const loading = operatorsLoading || weaponsLoading || mapsLoading;
  const error = operatorsError || weaponsError || mapsError;

  // Enrichir les données d'opérateurs avec des informations croisées
  const enrichedOperators = useMemo<EnrichedOperator[]>(() => {
    if (!operators || !weapons) return [];

    return operators.map(operator => {
      // Trouver les armes de l'opérateur
      const operatorWeapons = weapons.filter(weapon => 
        weapon.operators?.some((op: any) => op.name === operator.name)
      );

      // Calculer les types d'armes
      const weaponTypes = [...new Set(operatorWeapons.map(weapon => weapon.type))];
      
      // Calculer les statistiques d'armement
      const weaponCount = operatorWeapons.length;
      const averageWeaponDamage = operatorWeapons.length > 0 
        ? Math.round(operatorWeapons.reduce((sum, weapon) => sum + weapon.damage, 0) / operatorWeapons.length)
        : 0;
      
      // Vérifier si l'opérateur a une arme unique
      const hasUniqueWeapon = operatorWeapons.some(weapon => 
        weapon.operators && weapon.operators.length === 1
      );

      return {
        ...operator,
        weapons: operatorWeapons,
        weaponTypes,
        weaponCount,
        averageWeaponDamage,
        hasUniqueWeapon
      };
    });
  }, [operators, weapons]);

  // Enrichir les données d'armes
  const enrichedWeapons = useMemo<EnrichedWeapon[]>(() => {
    if (!weapons || !operators) return [];

    return weapons.map(weapon => {
      // Trouver les opérateurs qui utilisent cette arme
      const weaponOperators = operators.filter(operator =>
        weapon.operators?.some((op: any) => op.name === operator.name)
      );

      // Calculer un score d'efficacité basé sur les dégâts et la cadence
      const damageScore = weapon.damage / 100;
      const fireRateScore = weapon.fireRate ? weapon.fireRate / 1000 : 0.5;
      const effectivenessScore = (damageScore + fireRateScore) * 50;

      return {
        ...weapon,
        operators: weaponOperators,
        effectivenessScore
      };
    });
  }, [weapons, operators]);

  // Enrichir les données de cartes
  const enrichedMaps = useMemo<EnrichedMap[]>(() => {
    if (!maps || !operators) return [];

    return maps.map(map => {
      // Recommander des opérateurs pour cette carte
      const attackers = operators.filter(op => op.side === 'ATK').slice(0, 3);
      const defenders = operators.filter(op => op.side === 'DEF').slice(0, 3);

      return {
        ...map,
        bestOperators: {
          attackers,
          defenders
        }
      };
    });
  }, [maps, operators]);

  // Filtrer les opérateurs enrichis
  const filteredOperators = useMemo(() => {
    if (!enrichedOperators.length) return [];

    return enrichedOperators.filter(operator => {
      // Recherche textuelle
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        const matchesName = operator.name.toLowerCase().includes(search);
        const matchesRealName = operator.realname?.toLowerCase().includes(search);
        const matchesUnit = operator.unit?.toLowerCase().includes(search);
        
        if (!matchesName && !matchesRealName && !matchesUnit) {
          return false;
        }
      }

      // Filtres spécifiques aux opérateurs
      if (filters.operatorRole && filters.operatorRole !== 'Tous' && operator.roles !== filters.operatorRole) {
        return false;
      }

      if (filters.operatorSide && filters.operatorSide !== 'Tous' && operator.side !== filters.operatorSide) {
        return false;
      }

      if (filters.operatorSpeed && filters.operatorSpeed !== 'Tous' && operator.speed !== filters.operatorSpeed) {
        return false;
      }

      if (filters.operatorHealth && operator.health !== filters.operatorHealth) {
        return false;
      }

      if (filters.operatorUnit && operator.unit !== filters.operatorUnit) {
        return false;
      }

      if (filters.operatorCountry && operator.birthplace !== filters.operatorCountry) {
        return false;
      }

      if (filters.operatorSeason && operator.season_introduced !== filters.operatorSeason) {
        return false;
      }

      // Filtres armes
      if (filters.weaponType && filters.weaponType !== 'Tous') {
        if (!operator.weaponTypes.includes(filters.weaponType)) {
          return false;
        }
      }

      if (filters.weaponMinDamage && operator.averageWeaponDamage < filters.weaponMinDamage) {
        return false;
      }

      if (filters.weaponMaxDamage && operator.averageWeaponDamage > filters.weaponMaxDamage) {
        return false;
      }

      if (filters.weaponClass && filters.weaponClass !== 'Tous') {
        if (!operator.weapons?.some(weapon => weapon.class === filters.weaponClass)) {
          return false;
        }
      }

      if (filters.hasSpecificWeapon) {
        if (!operator.weapons?.some(weapon => 
          weapon.name.toLowerCase().includes(filters.hasSpecificWeapon!.toLowerCase())
        )) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedOperators, filters]);

  // Statistiques globales
  const stats = useMemo<CrossAPIStats>(() => {
    return {
      totalOperators: enrichedOperators.length,
      totalWeapons: enrichedWeapons.length,
      totalMaps: enrichedMaps.length,
      avgOperatorHealth: enrichedOperators.length > 0 
        ? Math.round(enrichedOperators.reduce((sum, op) => sum + op.health, 0) / enrichedOperators.length)
        : 0,
      avgWeaponDamage: enrichedWeapons.length > 0
        ? Math.round(enrichedWeapons.reduce((sum, weapon) => sum + weapon.damage, 0) / enrichedWeapons.length)
        : 0,
      mostCommonSpeed: '2',
      mostCommonWeaponType: 'Assault Rifle'
    };
  }, [enrichedOperators, enrichedWeapons, enrichedMaps]);

  // Données filtrées combinées
  const filteredData = useMemo<FilteredData>(() => ({
    operators: filteredOperators,
    weapons: enrichedWeapons,
    maps: enrichedMaps
  }), [filteredOperators, enrichedWeapons, enrichedMaps]);

  // Fonction d'analyse des synergies
  const analyzeSynergies = useCallback(async () => {
    if (!enrichedOperators.length || !enrichedWeapons.length || !enrichedMaps.length) {
      return null;
    }

    setIsAnalyzing(true);

    try {
      // Analyser les meilleures combinaisons opérateur-arme
      const bestOperatorWeaponCombos = enrichedOperators.map(operator => {
        const compatibleWeapons = enrichedWeapons.filter(weapon => 
          weapon.operators?.some((op: any) => op.name === operator.name) ||
          weapon.family === operator.side ||
          weapon.availableFor?.includes(operator.name)
        );

        if (compatibleWeapons.length === 0) return null;

        // Calculer le score de synergie
        const bestWeapon = compatibleWeapons.reduce((best: any, weapon) => {
          const damageScore = weapon.damage / 100;
          const fireRateScore = weapon.fireRate ? weapon.fireRate / 1000 : 0.5;
          const synergyScore = (damageScore + fireRateScore) * 50;
          
          return !best || synergyScore > best.synergyScore 
            ? { weapon, synergyScore }
            : best;
        }, null);

        return {
          operator,
          recommendedWeapon: bestWeapon?.weapon,
          synergyScore: bestWeapon?.synergyScore || 0
        };
      }).filter(Boolean).sort((a: any, b: any) => b.synergyScore - a.synergyScore);

      // Analyser les recommandations carte-opérateur
      const mapOperatorRecommendations = enrichedMaps.map(map => {
        const attackers = enrichedOperators.filter(op => op.side === 'ATK');
        const bestAttacker = attackers.reduce((best: any, op) => {
          const speedScore = parseInt(op.speed) / 3;
          const healthScore = op.health / 150;
          const score = (speedScore + healthScore) / 2;
          
          return !best || score > best.score ? { operator: op, score } : best;
        }, null);

        const defenders = enrichedOperators.filter(op => op.side === 'DEF');
        const bestDefender = defenders.reduce((best: any, op) => {
          const healthScore = op.health / 150;
          const weaponScore = (op.weapons?.length || 0) / 10;
          const score = (healthScore + weaponScore) / 2;
          
          return !best || score > best.score ? { operator: op, score } : best;
        }, null);

        return {
          map,
          bestAttacker: bestAttacker?.operator,
          bestDefender: bestDefender?.operator,
          attackerScore: bestAttacker?.score || 0,
          defenderScore: bestDefender?.score || 0
        };
      });

      // Analyser l'efficacité des armes
      const weaponEffectiveness = enrichedWeapons.map(weapon => {
        const damageScore = weapon.damage / 100;
        const fireRateScore = weapon.fireRate ? weapon.fireRate / 1000 : 0.5;
        const operatorCompatibility = weapon.operators?.length || 1;
        
        const effectiveness = (damageScore + fireRateScore + (operatorCompatibility / 10)) * 30;
        
        return {
          weapon,
          effectiveness
        };
      }).sort((a, b) => b.effectiveness - a.effectiveness);

      const result = {
        bestOperatorWeaponCombos,
        mapOperatorRecommendations,
        weaponEffectiveness,
        analysisDate: new Date().toISOString()
      };

      return result;
    } catch (error) {
      console.error('Erreur lors de l\'analyse des synergies:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [enrichedOperators, enrichedWeapons, enrichedMaps]);

  // Trouver les opérateurs compatibles avec une arme
  const getOperatorsByWeapon = useCallback((weaponName: string) => {
    const weapon = enrichedWeapons.find(w => w.name === weaponName);
    if (!weapon) return [];

    return enrichedOperators.filter(operator => 
      weapon.operators?.some((op: any) => op.name === operator.name) ||
      weapon.availableFor?.includes(operator.name)
    );
  }, [enrichedOperators, enrichedWeapons]);

  // Trouver les armes compatibles avec un opérateur
  const getWeaponsByOperator = useCallback((operatorName: string) => {
    const operator = enrichedOperators.find(op => op.name === operatorName);
    if (!operator) return [];

    return enrichedWeapons.filter(weapon => 
      weapon.operators?.some((op: any) => op.name === operator.name) ||
      weapon.family === operator.side ||
      weapon.availableFor?.includes(operator.name)
    );
  }, [enrichedOperators, enrichedWeapons]);

  // Recommander des opérateurs pour une carte
  const getRecommendedOperatorsForMap = useCallback((mapName: string, side: 'ATK' | 'DEF') => {
    const map = enrichedMaps.find(m => m.name === mapName);
    if (!map) return [];

    const operatorsForSide = enrichedOperators.filter(op => op.side === side);
    
    return operatorsForSide
      .map(operator => {
        let score = 0;
        
        if (side === 'ATK') {
          score += parseInt(operator.speed) * 10;
        } else {
          score += operator.health * 0.1;
        }
        
        score += (operator.weapons?.length || 0) * 5;
        
        return { operator, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.operator);
  }, [enrichedOperators, enrichedMaps]);

  return {
    // Données enrichies
    enrichedOperators,
    enrichedWeapons,
    enrichedMaps,
    
    // Données filtrées
    filteredData,
    
    // États
    loading,
    error,
    isAnalyzing,
    
    // Filtres
    filters,
    setFilters,
    
    // Statistiques
    stats,
    
    // Fonctions d'analyse
    analyzeSynergies,
    getOperatorsByWeapon,
    getWeaponsByOperator,
    getRecommendedOperatorsForMap,
    
    // Fonctions utilitaires
    resetFilters: () => setFilters({}),
    updateFilter: (key: keyof CrossAPIFilters, value: any) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };
}
