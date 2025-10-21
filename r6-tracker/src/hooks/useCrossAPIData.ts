/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback } from 'react';
import { useOperators, useWeapons, useMaps } from './useR6Data';
import type { Operator, Weapon, Map } from '../types/r6-api-types';

// Interface pour les données croisées d'un opérateur enrichi
export interface EnrichedOperator extends Operator {
  weapons?: Weapon[];
  weaponTypes?: string[];
  averageDamage?: number;
  weaponCount?: number;
  hasUniqueWeapon?: boolean;
  mapCompatibility?: number;
  popularity?: number;
  winRate?: number;
}

// Interface pour les armes enrichies
export interface EnrichedWeapon extends Omit<Weapon, 'operators'> {
  operators?: Operator[];
  effectivenessScore?: number;
}

// Interface pour les cartes enrichies
export interface EnrichedMap extends Map {
  bestAttackers?: Operator[];
  bestDefenders?: Operator[];
  recommendedWeapons?: Weapon[];
  strategicValue?: number;
  complexity?: number;
}

// Types pour les filtres croisés
export interface CrossAPIFilters {
  operatorSide?: 'ATK' | 'DEF' | 'ALL';
  weaponType?: string;
  mapLocation?: string;
  minWinRate?: number;
  hasGadget?: boolean;
  preferredRange?: 'close' | 'medium' | 'long';
}

// Interface pour les données de synergie
export interface SynergyData {
  bestOperatorWeaponCombos: Array<{
    operator: Operator;
    weapon: EnrichedWeapon;
    synergyScore: number;
    reasons: string[];
  }>;
  mapOperatorRecommendations: Array<{
    map: Map;
    recommendedAttackers: Operator[];
    recommendedDefenders: Operator[];
    reasoning: string;
  }>;
  weaponEffectiveness: Array<{
    weapon: EnrichedWeapon;
    effectivenessScore: number;
    bestMaps: string[];
    bestOperators: string[];
  }>;
}

// Hook principal pour les données croisées
export const useCrossAPIData = () => {
  const { operators, loading: operatorsLoading, error: operatorsError } = useOperators();
  const { weapons, loading: weaponsLoading, error: weaponsError } = useWeapons();
  const { maps, loading: mapsLoading, error: mapsError } = useMaps();

  const [filters, setFilters] = useState<CrossAPIFilters>({
    operatorSide: 'ALL',
    weaponType: 'all',
    mapLocation: 'all'
  });

  // État de chargement global
  const loading = operatorsLoading || weaponsLoading || mapsLoading;
  const error = operatorsError || weaponsError || mapsError;

  // Enrichir les données d'opérateurs avec des informations croisées
  const enrichedOperators = useMemo<EnrichedOperator[]>(() => {
    if (!operators || !weapons) return [];

    return operators.map((operator: any) => {
      // Trouver les armes de l'opérateur
      const operatorWeapons = weapons.filter((weapon: any) => 
        weapon.operators?.includes(operator.name) ||
        weapon.availableFor?.includes(operator.name)
      );

      // Calculer les types d'armes
      const weaponTypes = [...new Set(operatorWeapons.map((weapon: any) => weapon.type))];
      
      // Calculer les statistiques d'armement
      const weaponCount = operatorWeapons.length;
      const averageDamage = operatorWeapons.length > 0 
        ? Math.round(operatorWeapons.reduce((sum: number, weapon: any) => sum + weapon.damage, 0) / operatorWeapons.length)
        : 0;
      
      // Déterminer si l'opérateur a des armes uniques
      const hasUniqueWeapon = operatorWeapons.some((weapon: any) => {
        if (!weapon.operators) return false;
        
        // Gérer le cas string "Op1; Op2"
        if (typeof weapon.operators === 'string') {
          const opList = weapon.operators.split(';').map((op: string) => op.trim());
          return opList.length <= 2;
        }
        
        // Gérer le cas tableau
        if (Array.isArray(weapon.operators)) {
          return weapon.operators.length <= 2;
        }
        
        return false;
      });

      return {
        ...operator,
        weapons: operatorWeapons,
        weaponTypes,
        weaponCount,
        averageDamage,
        hasUniqueWeapon,
        mapCompatibility: Math.random() * 100, // Placeholder
        popularity: Math.random() * 100, // Placeholder
        winRate: Math.random() * 100 // Placeholder
      };
    });
  }, [operators, weapons]);

  // Enrichir les données d'armes avec des informations croisées
  const enrichedWeapons = useMemo<EnrichedWeapon[]>(() => {
    if (!weapons || !operators) return [];

    return weapons.map((weapon: any) => {
      // Trouver les opérateurs qui peuvent utiliser cette arme
      const weaponOperators = operators.filter((operator: any) =>
        weapon.operators?.includes(operator.name) ||
        weapon.availableFor?.includes(operator.name)
      );

      // Calculer un score d'efficacité basé sur les stats
      const effectivenessScore = Math.round(
        (weapon.damage * 0.4) + 
        (weapon.fireRate * 0.3) + 
        (weapon.mobility * 0.2) + 
        (weapon.capacity * 0.1)
      );

      return {
        ...weapon,
        operators: weaponOperators,
        effectivenessScore
      };
    });
  }, [weapons, operators]);

  // Enrichir les données de cartes avec des recommandations
  const enrichedMaps = useMemo<EnrichedMap[]>(() => {
    if (!maps || !operators) return [];

    return maps.map((map: any) => {
      // Recommandations basiques (à améliorer avec de vraies données)
      const attackers = operators.filter((op: any) => op.side === 'ATK').slice(0, 3);
      const defenders = operators.filter((op: any) => op.side === 'DEF').slice(0, 3);

      return {
        ...map,
        bestAttackers: attackers,
        bestDefenders: defenders,
        recommendedWeapons: weapons?.slice(0, 5) || [],
        strategicValue: Math.random() * 100,
        complexity: Math.random() * 100
      };
    });
  }, [maps, operators, weapons]);

  // Fonctions de filtrage avancé
  const getFilteredOperators = useCallback((customFilters?: Partial<CrossAPIFilters>) => {
    const activeFilters = { ...filters, ...customFilters };
    
    return enrichedOperators.filter(operator => {
      if (activeFilters.operatorSide && activeFilters.operatorSide !== 'ALL') {
        // Convertir les valeurs pour correspondre aux nouvelles données de l'API
        const operatorSideCode = operator.side === 'attacker' ? 'ATK' : 'DEF';
        if (operatorSideCode !== activeFilters.operatorSide) return false;
      }
      
      if (activeFilters.weaponType && activeFilters.weaponType !== 'all') {
        if (!operator.weaponTypes?.includes(activeFilters.weaponType)) return false;
      }
      
      if (activeFilters.minWinRate) {
        if ((operator.winRate || 0) < activeFilters.minWinRate) return false;
      }
      
      return true;
    });
  }, [enrichedOperators, filters]);

  const getFilteredWeapons = useCallback((customFilters?: Partial<CrossAPIFilters>) => {
    const activeFilters = { ...filters, ...customFilters };
    
    return enrichedWeapons.filter(weapon => {
      if (activeFilters.weaponType && activeFilters.weaponType !== 'all') {
        if (weapon.type !== activeFilters.weaponType) return false;
      }
      
      return true;
    });
  }, [enrichedWeapons, filters]);

  const getFilteredMaps = useCallback((customFilters?: Partial<CrossAPIFilters>) => {
    const activeFilters = { ...filters, ...customFilters };
    
    return enrichedMaps.filter(map => {
      if (activeFilters.mapLocation && activeFilters.mapLocation !== 'all') {
        if (map.location !== activeFilters.mapLocation) return false;
      }
      
      return true;
    });
  }, [enrichedMaps, filters]);

  // Analyse des synergies entre les différentes APIs
  const analyzeSynergies = useCallback((selectedOperators: Operator[] = []): SynergyData => {
    const bestOperatorWeaponCombos = selectedOperators.map(operator => {
      const compatibleWeapons = enrichedWeapons.filter(weapon => 
        weapon.operators?.some((op: any) => op.name === operator.name) ||
        weapon.availableFor?.includes(operator.name)
      );

      if (compatibleWeapons.length === 0) return null;

      const bestWeapon = compatibleWeapons.reduce((best: any, weapon) => {
        return (weapon.effectivenessScore || 0) > (best.effectivenessScore || 0) ? weapon : best;
      });

      return {
        operator,
        weapon: bestWeapon,
        synergyScore: (bestWeapon.effectivenessScore || 0) + Math.random() * 50,
        reasons: ['Compatibilité optimale', 'Haute efficacité', 'Synergie tactique']
      };
    }).filter((combo): combo is NonNullable<typeof combo> => combo !== null).sort((a: any, b: any) => b.synergyScore - a.synergyScore);

    const mapOperatorRecommendations = enrichedMaps.slice(0, 5).map(map => {
      const bestAttacker = (map.bestAttackers || []).reduce((best: any, op) => {
        return Math.random() > 0.5 ? op : best;
      }, map.bestAttackers?.[0]);

      const bestDefender = (map.bestDefenders || []).reduce((best: any, op) => {
        return Math.random() > 0.5 ? op : best;
      }, map.bestDefenders?.[0]);

      return {
        map,
        recommendedAttackers: bestAttacker ? [bestAttacker] : [],
        recommendedDefenders: bestDefender ? [bestDefender] : [],
        reasoning: `Optimisé pour ${map.name}`
      };
    });

    const weaponEffectiveness = enrichedWeapons
      .sort((a, b) => (b.effectivenessScore || 0) - (a.effectivenessScore || 0))
      .slice(0, 10)
      .map(weapon => ({
        weapon,
        effectivenessScore: weapon.effectivenessScore || 0,
        bestMaps: enrichedMaps.slice(0, 3).map(m => m.name),
        bestOperators: (weapon.operators || []).slice(0, 3).map((op: any) => op.name)
      }));

    return {
      bestOperatorWeaponCombos,
      mapOperatorRecommendations,
      weaponEffectiveness
    };
  }, [enrichedOperators, enrichedWeapons, enrichedMaps]);

  // Fonctions de recherche intelligente
  const smartSearch = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    
    const matchingOperators = enrichedOperators.filter(op => 
      op.name.toLowerCase().includes(lowercaseQuery) ||
      op.side?.toLowerCase().includes(lowercaseQuery) ||
      op.weaponTypes?.some((type: string) => type.toLowerCase().includes(lowercaseQuery))
    );

    const matchingWeapons = enrichedWeapons.filter(weapon =>
      weapon.name.toLowerCase().includes(lowercaseQuery) ||
      weapon.type.toLowerCase().includes(lowercaseQuery) ||
      weapon.class.toLowerCase().includes(lowercaseQuery)
    );

    const matchingMaps = enrichedMaps.filter(map =>
      map.name.toLowerCase().includes(lowercaseQuery) ||
      map.location?.toLowerCase().includes(lowercaseQuery)
    );

    return {
      operators: matchingOperators,
      weapons: matchingWeapons,
      maps: matchingMaps,
      total: matchingOperators.length + matchingWeapons.length + matchingMaps.length
    };
  }, [enrichedOperators, enrichedWeapons, enrichedMaps]);

  // Gestion des filtres
  const updateFilter = useCallback((key: keyof CrossAPIFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      operatorSide: 'ALL',
      weaponType: 'all',
      mapLocation: 'all'
    });
  }, []);

  return {
    // Données enrichies
    operators: enrichedOperators,
    weapons: enrichedWeapons,
    maps: enrichedMaps,
    
    // États
    loading,
    error,
    filters,
    
    // Fonctions de filtrage
    getFilteredOperators,
    getFilteredWeapons,
    getFilteredMaps,
    
    // Analyses avancées
    analyzeSynergies,
    smartSearch,
    
    // Gestion des filtres
    updateFilter,
    resetFilters
  };
};

export default useCrossAPIData;