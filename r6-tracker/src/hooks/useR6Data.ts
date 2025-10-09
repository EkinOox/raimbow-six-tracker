import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOperators, setFilters as setOperatorFilters, clearOperators, clearError as clearOperatorError } from '../store/slices/operatorsSlice';
import { fetchWeapons, setFilters as setWeaponFilters, clearWeapons, clearError as clearWeaponError } from '../store/slices/weaponsSlice';
import { fetchMaps, setFilters as setMapFilters, clearMaps, clearError as clearMapError } from '../store/slices/mapsSlice';
import { OperatorFilters, WeaponFilters, MapFilters } from '../types/r6-api-types';

// Hook pour les opérateurs
export const useOperators = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error, lastFetch, filters } = useAppSelector(state => state.operators);

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

  const clearData = useCallback(() => {
    dispatch(clearOperators());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearOperatorError());
  }, [dispatch]);

  return {
    operators: data,
    loading,
    error,
    lastFetch,
    filters: filters as OperatorFilters,
    loadOperators,
    updateFilters,
    clearData,
    clearErrors,
  };
};

// Hook pour les armes
export const useWeapons = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error, lastFetch, filters } = useAppSelector(state => state.weapons);

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

  const clearData = useCallback(() => {
    dispatch(clearWeapons());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearWeaponError());
  }, [dispatch]);

  return {
    weapons: data,
    loading,
    error,
    lastFetch,
    filters: filters as WeaponFilters,
    loadWeapons,
    updateFilters,
    clearData,
    clearErrors,
  };
};

// Hook pour les maps
export const useMaps = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error, lastFetch, filters } = useAppSelector(state => state.maps);

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

  const clearData = useCallback(() => {
    dispatch(clearMaps());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearMapError());
  }, [dispatch]);

  return {
    maps: data,
    loading,
    error,
    lastFetch,
    filters: filters as MapFilters,
    loadMaps,
    updateFilters,
    clearData,
    clearErrors,
  };
};