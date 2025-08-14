import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
    id: string;
    productId: string;
    productVariantId?: string | null;
    quantity: number;
    price: number;
    productName: string;
    thumbnail: string;
    stockQuantity?: number;
    isSelected?: boolean;
}


interface SellerGroup {
    sellerId: string;
    sellerName: string;
    items: CartItem[];
}

interface CartState {
    groupedItems: SellerGroup[];
}

const initialState: CartState = {
    groupedItems: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartItems(state, action: PayloadAction<SellerGroup[]>) {
            state.groupedItems = action.payload.map(group => ({
                ...group,
                items: group.items.map(item => ({
                    ...item,
                    isSelected: item.isSelected ?? false,
                })),
            }));
        },
        resetCart(state) {
            state.groupedItems = [];
        },
        updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
            const { id, quantity } = action.payload;
            for (const group of state.groupedItems) {
                const item = group.items.find(i => i.id === id);
                if (item) {
                    const minQty = 1;
                    const maxQty = item.stockQuantity ?? Infinity;
                    item.quantity = Math.max(minQty, Math.min(maxQty, quantity));
                    break;
                }
            }
        },
        toggleItemSelection(state, action: PayloadAction<{ id: string; isSelected: boolean }>) {
            const { id, isSelected } = action.payload;
            for (const group of state.groupedItems) {
                const item = group.items.find(i => i.id === id);
                if (item) {
                    item.isSelected = isSelected;
                    break;
                }
            }
        },
        toggleSelectAll(state, action: PayloadAction<boolean>) {
            const selectAll = action.payload;
            for (const group of state.groupedItems) {
                group.items.forEach(item => {
                    item.isSelected = selectAll;
                });
            }
        },
        removeSelectedItems(state) {
            state.groupedItems = state.groupedItems
                .map(group => ({
                    ...group,
                    items: group.items.filter(item => !item.isSelected),
                }))
                .filter(group => group.items.length > 0);
        },

        addItem(
            state,
            action: PayloadAction<CartItem & { sellerId: string; sellerName: string }>
        ) {
            const { sellerId, sellerName, ...itemToAdd } = action.payload;
            let group = state.groupedItems.find(g => g.sellerId === sellerId);
            if (!group) {
                group = {
                    sellerId,
                    sellerName,
                    items: [],
                };
                state.groupedItems.push(group);
            }
            const existingItem = group.items.find(i => i.id === itemToAdd.id);

            if (existingItem) {
                existingItem.quantity += itemToAdd.quantity;
            } else {
                group.items.push({ ...itemToAdd, isSelected: false });
            }
        },
    },
});

export const {
    setCartItems,
    resetCart,
    updateQuantity,
    toggleItemSelection,
    toggleSelectAll,
    removeSelectedItems,
    addItem,
} = cartSlice.actions;

export default cartSlice.reducer;
