import { axiosClient, axiosClientFile, axiosClientNoAuth } from "../../services/axiosConfig";

export const getAllCategories = async (body: any) => {
    const url = `/Category/get-all`;
    return axiosClientNoAuth.post(url, body);
}
export const getCategoryOfSeller = async (body: any) => {
    const url = `/Category/GetCategoryOfSeller`;
    return axiosClient.post(url, body);
}
export const createCategory = async (body: any) => {
    const url = `/Category/create`;
    return axiosClientFile.post(url, body);
}
export const deleteCategory = (id: string) => {
    return axiosClientNoAuth.delete(`/Category/delete/${id}`);
};
export const getDetailCategory = async (id: string) => {
    const url = `/Category/detail/${id}`;
    return axiosClientNoAuth.get(url);
};
export const updateCategory = (id: string, body: any) => {
    const url = `/Category/update/${id}`;
    return axiosClientFile.put(url, body);
}
