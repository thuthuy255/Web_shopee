// features/slices/product.slice.ts
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    products: [],         // đây mới là danh sách sản phẩm
    currentProduct: null, // optional: để lưu 1 sản phẩm đang xem
};

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setProductList: (state, action) => {
            state.products = action.payload; // payload là mảng sản phẩm
        },
        setCurrentProduct: (state, action) => {
            state.currentProduct = action.payload; // 1 sản phẩm
        },
    },
});

export const { setProductList, setCurrentProduct } = productSlice.actions;
export const InfoProductState = (state: any) => state.product;
export default productSlice.reducer;
