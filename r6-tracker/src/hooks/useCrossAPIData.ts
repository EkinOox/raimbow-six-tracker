import { useState, useEffect, useMemo } from 'react';
import { useOperators, useWeapons, useMaps } from './useR6Data';
import { Operator, Weapon, Map } from '../types/r6-api-types';

// Interface pour les données enrichies d'un opérateur
export interface EnrichedOperator extends Operator {
  weapons: Weapon[];
  availableMaps: Map[];
  weaponTypes: string[];
  weaponCount: number;
  averageWeaponDamage: number;
  hasUniqueWeapon: boolean;
}

// Interface pour les filtres croisés
export interface CrossAPIFilters {
  // Filtres opérateurs
  operatorRole?: string;
  operatorSide?: string;
  operatorSpeed?: string;
  operatorHealth?: { min: number; max: number };
  operatorUnit?: string;
  operatorCountry?: string;
  operatorSeason?: string;
  
  // Filtres armes
  weaponType?: string;
  weaponMinDamage?: number;
  weaponMaxDamage?: number;
  weaponClass?: string;
  hasSpecificWeapon?: string;
  
  // Filtres cartes
  mapPlaylist?: string;
  mapLocation?: string;
  preferredMaps?: string[];
  
  // Recherche globale
  searchTerm?: string;
}

export function useCrossAPIData() {
  const { operators, loading: operatorsLoading, error: operatorsError, loadOperators } = useOperators();
  const { weapons, loading: weaponsLoading, error: weaponsError, loadWeapons } = useWeapons();
  const { maps, loading: mapsLoading, error: mapsError, loadMaps } = useMaps();
  
  const [filters, setFilters] = useState<CrossAPIFilters>({});
  const [enrichedOperators, setEnrichedOperators] = useState<EnrichedOperator[]>([]);

  // Charger toutes les données
  useEffect(() => {
    loadOperators();
    loadWeapons();
    loadMaps();
  }, [loadOperators, loadWeapons, loadMaps]);

  // Enrichir les données des opérateurs avec les armes et cartes
  const enrichOperatorsData = useMemo(() => {
    if (!operators || !weapons || !maps) return [];

    return operators.map((operator: Operator) => {
      // Trouver les armes de cet opérateur
      const operatorWeapons = weapons.filter((weapon: Weapon) => 
        weapon.availableFor?.includes(operator.name) || 
        weapon.operators?.includes(operator.name) ||
        weapon.operators?.includes(operator.safename)
      );

      // Calculer les statistiques d'armes
      const weaponTypes = [...new Set(operatorWeapons.map(w => w.type))];
      const averageWeaponDamage = operatorWeapons.length > 0 
        ? operatorWeapons.reduce((sum, w) => sum + (w.damage || 0), 0) / operatorWeapons.length 
        : 0;
      
      // Détecter si l'opérateur a une arme unique
      const hasUniqueWeapon = operatorWeapons.some(weapon => 
        weapon.availableFor?.length === 1 || weapon.operators?.length === 1
      );

      // Cartes recommandées selon le rôle de l'opérateur
      const availableMaps = maps.filter((map: Map) => {
        // Logique simple : tous les opérateurs peuvent jouer sur toutes les cartes
        // On pourrait ajouter une logique plus complexe basée sur les playlists
        return map.playlists.includes('Ranked') || map.playlists.includes('Casual');
      });

      const enrichedOperator: EnrichedOperator = {
        ...operator,
        weapons: operatorWeapons,
        availableMaps,
        weaponTypes,
        weaponCount: operatorWeapons.length,
        averageWeaponDamage: Math.round(averageWeaponDamage),
        hasUniqueWeapon
      };

      return enrichedOperator;
    });
  }, [operators, weapons, maps]);

  // Mettre à jour les données enrichies
  useEffect(() => {
    setEnrichedOperators(enrichOperatorsData);
  }, [enrichOperatorsData]);

  // Filtrage croisé des opérateurs
  const filteredOperators = useMemo(() => {
    if (!enrichedOperators.length) return [];

    return enrichedOperators.filter((operator) => {
      // Recherche textuelle globale
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        const matchesOperator = operator.name.toLowerCase().includes(search) ||
          operator.realname?.toLowerCase().includes(search) ||
          operator.unit?.toLowerCase().includes(search) ||
          operator.birthplace?.toLowerCase().includes(search);
        
        const matchesWeapons = operator.weapons.some(weapon => 
          weapon.name.toLowerCase().includes(search) ||
          weapon.type.toLowerCase().includes(search)
        );

        if (!matchesOperator && !matchesWeapons) return false;
      }

      // Filtres opérateur
      if (filters.operatorRole && filters.operatorRole !== 'Tous' && operator.roles !== filters.operatorRole) {
        return false;
      }

      if (filters.operatorSide && filters.operatorSide !== 'Tous' && operator.side !== filters.operatorSide) {
        return false;
      }

      if (filters.operatorSpeed && filters.operatorSpeed !== 'Tous' && operator.speed !== filters.operatorSpeed) {
        return false;
      }

      if (filters.operatorHealth) {
        if (operator.health < filters.operatorHealth.min || operator.health > filters.operatorHealth.max) {
          return false;
        }
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
        if (!operator.weapons.some(weapon => weapon.class === filters.weaponClass)) {
          return false;
        }
      }

      if (filters.hasSpecificWeapon) {
        if (!operator.weapons.some(weapon => 
          weapon.name.toLowerCase().includes(filters.hasSpecificWeapon!.toLowerCase())
        )) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedOperators, filters]);

  // Statistiques globales
  const statistics = useMemo(() => {
    if (!enrichedOperators.length) return null;

    const totalOperators = enrichedOperators.length;
    const attackers = enrichedOperators.filter(op => op.side === 'ATK').length;
    const defenders = enrichedOperators.filter(op => op.side === 'DEF').length;
    
    const allWeaponTypes = [...new Set(enrichedOperators.flatMap(op => op.weaponTypes))];
    const allUnits = [...new Set(enrichedOperators.map(op => op.unit))].filter(Boolean);
    const allCountries = [...new Set(enrichedOperators.map(op => op.birthplace))].filter(Boolean);
    const allSeasons = [...new Set(enrichedOperators.map(op => op.season_introduced))].filter(Boolean).sort();
    
    const avgWeaponCount = enrichedOperators.reduce((sum, op) => sum + op.weaponCount, 0) / totalOperators;
    const avgDamage = enrichedOperators.reduce((sum, op) => sum + op.averageWeaponDamage, 0) / totalOperators;
    
    const uniqueWeaponOperators = enrichedOperators.filter(op => op.hasUniqueWeapon).length;

    return {
      totalOperators,
      attackers,
      defenders,
      allWeaponTypes: allWeaponTypes.sort(),
      allUnits: allUnits.sort(),
      allCountries: allCountries.sort(),
      allSeasons,
      avgWeaponCount: Math.round(avgWeaponCount * 10) / 10,
      avgDamage: Math.round(avgDamage),
      uniqueWeaponOperators,
      filteredCount: filteredOperators.length
    };
  }, [enrichedOperators, filteredOperators]);

  // États de chargement et d'erreur combinés
  const loading = operatorsLoading || weaponsLoading || mapsLoading;
  const error = operatorsError || weaponsError || mapsError;

  return {
    // Données
    operators: enrichedOperators,
    filteredOperators,
    weapons,
    maps,
    statistics,
    
    // États
    loading,
    error,
    
    // Fonctions
    setFilters,
    filters,
    
    // Fonctions utilitaires
    resetFilters: () => setFilters({}),
    updateFilter: (key: keyof CrossAPIFilters, value: any) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    
    // Données pour les filtres
    availableWeaponTypes: statistics?.allWeaponTypes || [],
    availableUnits: statistics?.allUnits || [],
    availableCountries: statistics?.allCountries || [],
    availableSeasons: statistics?.allSeasons || []
  };
}