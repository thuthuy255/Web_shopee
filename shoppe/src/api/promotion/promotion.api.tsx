import { axiosClient, axiosClientNoAuth } from "../../services/axiosConfig";

export const getPromotions = (body: any) => {
    const url = '/Promotion/getPromotion';
    return axiosClientNoAuth.post(url, body);
};
export const createPromotion = (body: any) => {
    const url = '/Promotion/createPromotion';
    return axiosClient.post(url, body);
};
export const deletePromotion = (id: string) => {
    const url = `/Promotion/delete/${id}`;
    return axiosClient.delete(url);
};
export const getDetailPromotion = (id: string) => {
    const url = `/Promotion/getDetailPromotion?id=${id}`;
    return axiosClient.get(url);
};
export const updatePromotion = (body: any) => {
    const url = `/Promotion/updatePromotion`;
    return axiosClient.put(url, body);
}
