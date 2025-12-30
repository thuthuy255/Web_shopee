import {
  axiosClient,
  axiosClientFile,
  axiosClientNoAuth,
} from "../services/axiosConfig";

export const getUserInfo = () => {
  const url = `/Auth/getUserInfo`;
  return axiosClient.get(url);
};
export const updateUser = (body: any) => {
  const url = `/User/updateUser`;
  return axiosClientFile.post(url, body);
};

export const getAllUser = (body: any) => {
  const url = `/User/getAllUser`;
  return axiosClient.post(url, body);
};
