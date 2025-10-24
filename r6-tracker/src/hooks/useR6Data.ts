import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOperators, setFilters as setOperatorFilters, clearError as clearOperatorError } from '../store/slices/operatorsSlice';
import { fetchWeapons, setFilters as setWeaponFilters, clearError as clearWeaponError } from '../store/slices/weaponsSlice';
import { fetchMaps, setFilters as setMapFilters, clearError as clearMapError, cacheMapImage } from '../store/slices/mapsSlice';
import { OperatorFilters, WeaponFilters, MapFilters } from '../types/r6-api-types';

// Hook pour les opérateurs
export const useOperators = () => {
  const dispatch = useAppDispatch();
  const { operators, loading, error, lastFetch, filters } = useAppSelector(state => state.operators);

  const loadOperators = useCallback(
    (filters: OperatorFilters = {}) => {
      dispatch(fetchOperators(filters));
    },
    [dispatch]
  );

  const updateFilters = useCallback(
    (filters: OperatorFilters) => {
      dispatch(setOperatorFilters(filters));
      dispatch(fetchOperators(filters));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearOperatorError());
  }, [dispatch]);

  return {
    operators,
    loading,
    error,
    lastFetch,
    filters,
    updateFilters,
    loadOperators,
    refreshOperators: loadOperators,
    clearError: clearErrors
  };
};

// Hook pour les armes
export const useWeapons = () => {
  const dispatch = useAppDispatch();
  const { weapons, loading, error, lastFetch, filters } = useAppSelector(state => state.weapons);

  const loadWeapons = useCallback(
    (filters: WeaponFilters = {}) => {
      dispatch(fetchWeapons(filters));
    },
    [dispatch]
  );

  const updateFilters = useCallback(
    (filters: WeaponFilters) => {
      dispatch(setWeaponFilters(filters));
      dispatch(fetchWeapons(filters));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearWeaponError());
  }, [dispatch]);

  return {
    weapons,
    loading,
    error,
    lastFetch,
    filters: filters as WeaponFilters,
    loadWeapons,
    updateFilters,
    clearErrors,
  };
};

// Hook pour les maps
export const useMaps = () => {
  const dispatch = useAppDispatch();
  const { maps, loading, error, lastFetch, filters, imageCache } = useAppSelector(state => state.maps);

  const loadMaps = useCallback(
    (filters: MapFilters = {}) => {
      dispatch(fetchMaps(filters));
    },
    [dispatch]
  );

  const updateFilters = useCallback(
    (filters: MapFilters) => {
      dispatch(setMapFilters(filters));
      dispatch(fetchMaps(filters));
    },
    [dispatch]
  );

  const loadMapImage = useCallback(
    (mapName: string) => {
      if (!imageCache[mapName]) {
        dispatch(cacheMapImage(mapName));
      }
    },
    [dispatch, imageCache]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearMapError());
  }, [dispatch]);

  return {
    maps,
    loading,
    error,
    lastFetch,
    filters: filters as MapFilters,
    imageCache,
    loadMaps,
    updateFilters,
    loadMapImage,
    clearErrors,
  };
};