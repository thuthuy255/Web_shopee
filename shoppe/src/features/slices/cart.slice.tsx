import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { ICart } from "../../untils/types/TypeCartItem";




interface CartState {
    data: ICart[];
    totalRecord: number;
    totalCartItem: number;
}

const initialState: CartState = {
    data: [],
    totalRecord: 0,
    totalCartItem: 0,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCart: (state, action: PayloadAction<CartState>) => {
            state.data = action.payload.data;
            state.totalRecord = action.payload.totalRecord;
            state.totalCartItem = action.payload.totalCartItem;
        },
        updateItemQuantity: (
            state,
            action: PayloadAction<{ itemId: string; quantity: number }>
        ) => {
            for (const seller of state.data) {
                const item = seller.items.find((i) => i.id === action.payload.itemId);
                if (item) {
                    item.quantity = action.payload.quantity;
                    break;
                }
            }
        },

        // addCartItem: (state, action: PayloadAction<SellerCart>) => {
        //     const sellerIndex = state.data.findIndex(s => s.sellerId === action.payload.sellerId);
        //     if (sellerIndex >= 0) {
        //         action.payload.items.forEach(newItem => {
        //             const existing = state.data[sellerIndex].items.find(i => i.productVariantId === newItem.productVariantId);
        //             if (existing) {
        //                 existing.quantity = newItem.quantity; // ✅ luôn đồng bộ theo BE
        //             } else {
        //                 state.data[sellerIndex].items.push(newItem);
        //             }
        //         });
        //     } else {
        //         state.data.push(action.payload);
        //     }
        //     state.totalCartItem = state.data.reduce((sum, s) => sum + s.items.length, 0);
        // },


    },
});

export const { setCart, updateItemQuantity } = cartSlice.actions;

export const getCartState = (state: RootState) => state.cart;
export const getTotalCartItem = (state: RootState) => state.cart.totalCartItem;

export default cartSlice.reducer;
