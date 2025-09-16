import { axiosClient } from "../../services/axiosConfig";

export const createOrder = (body: any) => {
    const url = "/Order/create";
    return axiosClient.post(url, body);
};

export const updateOrderInfo = (orderId: string, body: any) => {
    const url = `/Order/${orderId}/update-info`;
    return axiosClient.post(url, body);
};

export const getUserOrders = () => {
    const url = "/Order/my-orders";
    return axiosClient.get(url);
};

export const getOrderDetail = (orderId: string) => {
    const url = `/Order/${orderId}`;
    return axiosClient.get(url);
};
export const paymentOrder = (body: any) => {
    const url = "Payment/CreatePayment";
    return axiosClient.post(url, body);
}