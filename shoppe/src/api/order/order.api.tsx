import { get } from "lodash";
import { axiosClient, axiosClientNoAuth } from "../../services/axiosConfig";

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
export const getUserOrdersOfSeller = (body: any) => {
    const url = "/Order/GetOrderUser";
    return axiosClient.post(url, body);
};
export const getOrderDetail = (orderId: string) => {
    const url = `/Order/${orderId}`;
    return axiosClient.get(url);
};
export const paymentOrder = (body: any) => {
    const url = "Payment/CreatePayment";
    return axiosClient.post(url, body);
}
export const getVnPayReturn = () => {
    const url = `/Payment/VnpayReturn${window.location.search}`;
    return axiosClientNoAuth.get(url); // GET request với query string
};
export const getMyPaidOrders = () => {
    const url = "/Order/my-paid-orders";
    return axiosClient.get(url);
}