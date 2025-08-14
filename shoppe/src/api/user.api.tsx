import { axiosClient, axiosClientNoAuth } from "../services/axiosConfig";

export const getUserInfo = () => {
  const url = `/Auth/getUserInfo`;
  return axiosClient.get(url);
};
export const updateUser = (body: any) => {
  const url = `/User/updateUser`;
  return axiosClientNoAuth.post(url, body);
};
