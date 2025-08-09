import { axiosClient, axiosClientNoAuth } from "../services/axiosConfig";

export const getUserInfo = () => {
    const url = `/Auth/getUserInfo`;
    return axiosClient.get(url);
};