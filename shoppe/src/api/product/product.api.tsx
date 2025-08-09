import { axiosClient, axiosClientFile, axiosClientNoAuth } from "../../services/axiosConfig";

export const getAllProductOfSeller = (body: any) => {
    const url = `/Product/getMyProducts`;
    return axiosClient.post(url, body);
};
export const getAllProduct = (body: any) => {
    const url = `/Product/getAllProduct`;
    return axiosClientNoAuth.post(url, body);
};
export const inserProduct = (body: any) => {
    const url = '/Product/insertProduct';
    return axiosClientFile.post(url, body);
}
export const deleteProduct = (id: string) => {
    const url = `/Product/deleteProduct?productId=${id}`;
    return axiosClient.delete(url);
};
export const updateProduct = (id: string, body: any) => {
    const url = `/Product/updateProduct?productId=${id}`;
    return axiosClientFile.put(url, body);
}
export const getDetailProduct = (id: string) => {
    const url = `/Product/getDetailProduct?productId=${id}`;
    return axiosClientNoAuth.get(url);
}