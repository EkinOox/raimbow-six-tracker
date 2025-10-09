import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import operatorsReducer from './slices/operatorsSlice';
import weaponsReducer from './slices/weaponsSlice';
import mapsReducer from './slices/mapsSlice';

// Configuration du store Redux
export const store = configureStore({
  reducer: {
    operators: operatorsReducer,
    weapons: weaponsReducer,
    maps: mapsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer les actions de Redux Toolkit qui contiennent des fonctions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks typés pour React Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;