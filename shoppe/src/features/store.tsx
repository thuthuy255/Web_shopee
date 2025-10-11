import { configureStore } from '@reduxjs/toolkit';
import appReducer from '../features/slices/app.slice';
import userReducer from '../features/slices/user.slice';
import cartReducer from '../features/slices/cart.slice';
import ProductReducer from '../features/slices/product.slice';

export const store = configureStore({
    reducer: {
        app: appReducer,
        user: userReducer,
        cart: cartReducer,
        product: ProductReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
