import { axiosClient } from "../../services/axiosConfig";

export const createCartItem = (body: any) => {
    const url = '/CartItem/add';
    return axiosClient.post(url, body);
}
export const getUserCartItems = () => {
    const url = '/CartItem/user';
    return axiosClient.get(url);
}
export const deleteAllCart = () => {
    const url = '/CartItem/deleteAllItem';
    return axiosClient.delete(url);
}
export const deleteSelectedCart = () => {
    const url = '/CartItem/selected';
    return axiosClient.delete(url);
}
export const toggleCartItemSelection = (productId: string, isSelected: boolean) => {
    const url = `/CartItem/toggle-selection?productId=${productId}&isSelected=${isSelected}`;
    return axiosClient.post(url);
};

export const toggleSelectAllCart = () => {
    return axiosClient.post('/CartItem/toggle-select-all');
};