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
export const SendOtp = (body: { email: string }) => {
  const url = `/auth/forgot-password`;
  return axiosClientNoAuth.post(url, body);
};
export const VerifyOtp = (body: { email: string; otp: string }) => {
  const url = `/auth/verify-otp`;
  return axiosClientNoAuth.post(url, body);
};
export const ResetPassword = (body: { email: string; newPassword: string }) => {
  const url = `/auth/reset-password`;
  return axiosClientNoAuth.post(url, body);
};

export const ToggleLock = (userId: string) => {
  const url = `/auth/toggle-lock/${userId}`;
  return axiosClient.post(url);
};
