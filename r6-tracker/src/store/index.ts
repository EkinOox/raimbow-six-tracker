import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import { combineReducers } from '@reduxjs/toolkit';
import operatorsReducer from './slices/operatorsSlice';
import weaponsReducer from './slices/weaponsSlice';
import mapsReducer from './slices/mapsSlice';
import authReducer from './slices/authSlice';
import favoritesReducer from './slices/favoritesSlice';

// Configuration de persistence pour le cache d'images des cartes
const mapsPersistConfig = {
  key: 'maps',
  storage,
  // Persister uniquement le cache d'images pour éviter de surcharger le localStorage
  whitelist: ['imageCache']
};

// Combiner les reducers
const rootReducer = combineReducers({
  operators: operatorsReducer,
  weapons: weaponsReducer,
  maps: persistReducer(mapsPersistConfig, mapsReducer),
  auth: authReducer,
  favorites: favoritesReducer,
});

// Configuration du store Redux
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Créer le persistor
export const persistor = persistStore(store);

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks typés pour React Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;