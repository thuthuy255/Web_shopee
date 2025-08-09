// features/slices/cart.slice.ts
import { createSlice, type PayloadAction, } from '@reduxjs/toolkit';

export interface CartItem {
    id: string;
    productId: string;
    productVariantId?: string;
    quantity: number;
    price: number;
    product: {
        name: string;
        thumbnail: string;
    };
}


interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartItems(state, action: PayloadAction<CartItem[]>) {
            state.items = action.payload;
        },
        resetCart(state) {
            state.items = [];
        },

        addItem(state, action: PayloadAction<CartItem>) {
            const existing = state.items.find(
                (item) =>
                    item.productId === action.payload.productId &&
                    item.productVariantId === action.payload.productVariantId
            );
            if (existing) {
                existing.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
        },
        updateQuantity(
            state,
            action: PayloadAction<{ id: string; quantity: number }>
        ) {
            const item = state.items.find((item) => item.id === action.payload.id);
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },

    },
});

export const {
    setCartItems,
    resetCart,
    addItem,
    updateQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
