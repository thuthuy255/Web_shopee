import { axiosClient } from "../../services/axiosConfig";

export const createCartItem = (body: any) => {
    const url = '/CartItem/add';
    return axiosClient.post(url, body);
}
export const getUserCartItems = (body: any) => {
    const url = '/CartItem/GetUserCartAsync';
    return axiosClient.post(url, body);
}
export const deleteAllCart = () => {
    const url = '/CartItem/deleteAllItem';
    return axiosClient.delete(url);
}
export const deleteSelectedCart = () => {
    const url = '/CartItem/selected';
    return axiosClient.delete(url);
}
export const removeCartItem = (id: string) => {
    const url = `/CartItem/removeCartItem?cartItemId=${id}`;
    return axiosClient.delete(url);
};
export const toggleCartItemSelection = (productId: string, isSelected: boolean, productVariantId?: string | null) => {
    return axiosClient.post('/CartItem/toggle-selection', {
        productId,
        isSelected,
        productVariantId: productVariantId || null,
    });
};
export const toggleSelectAllCart = () => {
    return axiosClient.post('/CartItem/toggle-select-all');
};
export const updateCartItem = (body: any) => {
    const url = '/CartItem/updateCartItem';
    return axiosClient.put(url, body);
};
