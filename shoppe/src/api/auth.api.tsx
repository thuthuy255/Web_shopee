import { axiosClient, axiosClientNoAuth } from "../services/axiosConfig";

export const LoginAPI = (body: any) => {
    const url = `/Auth/login`;
    return axiosClientNoAuth.post(url, body);
};
export const RegisterbyAdmin = (body: any) => {
    const url = `/Auth/registerbyAdmin`;
    return axiosClient.post(url, body);
};
export const RegisterUser = (body: any) => {
    const url = `/Auth/register`;
    return axiosClientNoAuth.post(url, body);
};