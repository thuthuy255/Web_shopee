import { axiosClient } from "../../services/axiosConfig";

export const createAddress = (body: any) => {
    const url = '/Address';
    return axiosClient.post(url, body);
};

export const updateAddress = (body: any) => {
    const url = '/Address';
    return axiosClient.put(url, body);
};

export const deleteAddress = (id: string) => {
    const url = `/Address/${id}`;
    return axiosClient.delete(url);
};

export const getUserAddresses = () => {
    const url = '/Address/mine';
    return axiosClient.get(url);
};
