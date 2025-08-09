import { axiosClientFile, axiosClientNoAuth } from "../../services/axiosConfig";

export const getAllCategories = async (body: any) => {
    const url = `/Category/get-all`;
    return axiosClientNoAuth.post(url, body);
}
export const createCategory = async (body: any) => {
    const url = `/Category/create`;
    return axiosClientFile.post(url, body);
}
export const deleteCategory = (id: string) => {
    return axiosClientNoAuth.delete(`/Category/delete/${id}`);
};
