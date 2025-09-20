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
export const getVariantsByProduct = (productId: string) => {
    const url = `/Variant/GetVarianByProduct?productId=${productId}`;
    return axiosClient.get(url);
};
export const addSingleVariant = (body: any) => {
    const url = `/Variant/AddSingleVariant`;
    return axiosClientFile.post(url, body);
};
export const updateVariant = (id: string, body: any) => {
    const url = `/Variant/UpdateVariant/${id}`;
    return axiosClientFile.put(url, body);
};

export const deleteVariant = (variantId: string) => {
    const url = `/Product/deleteVariants?variantId=${variantId}`;
    return axiosClient.delete(url);
};
export const getInfoShop = (id: string, body: any) => {
    const url = `/Product/GetInfoShop?sellerId=${id}`;
    return axiosClientNoAuth.post(url, body);
}
export const getProductsByCategory = async (categoryId: string, body: any) => {
    const url = `Product/by-category/${categoryId}`
    return axiosClientNoAuth.post(url, body);
};
