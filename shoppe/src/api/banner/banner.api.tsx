import { axiosClient, axiosClientFile, axiosClientNoAuth } from "../../services/axiosConfig";

export const getAllBanner = (body: any) => {
    const url = `/Banner/getAllBanner`;
    return axiosClientNoAuth.post(url, body);
};
export const createBanner = (body: any) => {
    const url = `/Banner/createBanner`;
    return axiosClientFile.post(url, body);
};
export const getBannerDetail = (id: string) => {
    const url = `/Banner/getDetailBanner/${id}`;
    return axiosClientNoAuth.get(url);
}
export const updateBanner = (body: any) => {
    const url = `/Banner/updateBanner`;
    return axiosClientFile.put(url, body);
};
export const deleteBanner = (id: string) => {
    const url = `/Banner/deleteBanner/${id}`;
    return axiosClient.delete(url);
};
export const getBannerByType = (type: string) => {
    const normalizedType = type.toLowerCase();
    const url = `/Banner/getByType?type=${encodeURIComponent(normalizedType)}`;
    return axiosClientNoAuth.get(url);
};
