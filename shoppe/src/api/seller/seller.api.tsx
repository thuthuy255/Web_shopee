import { axiosClient, axiosClientFile, axiosClientNoAuth } from "../../services/axiosConfig";

export const getAllSeller = (body: any) => {
    const url = `/User/getAllSeller`;
    return axiosClientNoAuth.post(url, body);
};
export const updateSeller = (formData: FormData) => {
    const url = '/User/updateUser';
    return axiosClientFile.post(url, formData);
};
export const getDetailSeller = (id: string) => {
    return axiosClient.post(`/User/getDetailUser?id=${id}`);
};
export const deleteSeller = (id: string) => {
    return axiosClient.post(`/User/deleteUser?id=${id}`);
};