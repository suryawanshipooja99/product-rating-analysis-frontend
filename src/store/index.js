import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import analyticsReducer from './slices/analyticsSlice';
import importReducer from './slices/importSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    analytics: analyticsReducer,
    import: importReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
