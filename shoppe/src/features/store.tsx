import { configureStore } from '@reduxjs/toolkit';
import appReducer from '../features/slices/app.slice';
import userReducer from '../features/slices/user.slice';
import cartReducer from '../features/slices/cart.slice';

export const store = configureStore({
    reducer: {
        app: appReducer,
        user: userReducer,
        cart: cartReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
