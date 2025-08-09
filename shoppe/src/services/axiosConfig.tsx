// src/services/axiosConfig.ts
import axios from "axios";
import { resetLogin } from "../features/slices/app.slice";
import { store } from "../features/store";
import { APP_URL } from "../constants/Url";

const handleRequest = (config: any) => {
    const storeState = store.getState();
    const access_token = storeState.app.token || localStorage.getItem("access_token");

    if (access_token && config.headers) {
        config.headers["Authorization"] = `Bearer ${access_token}`;
    }

    // Để axios tự throw lỗi nếu ngoài 200–299
    config.validateStatus = (status: number) => {
        return status >= 200 && status < 300;
    };

    return config;
};

const handleRequestError = (error: any) => {
    return Promise.reject(error);
};

const handleResponse = (response: any) => {
    return response.data;
};

const handleResponseError = async (error: any) => {
    console.error("axios error:", error);

    if (error.response?.status === 401) {
        const dispatch = store.dispatch;
        dispatch(resetLogin());
        localStorage.removeItem("access_token");

        // ⚠️ Tránh redirect vòng lặp nếu đang ở chính trang login
        if (!window.location.pathname.startsWith('/auth/login')) {
            window.location.href = "/auth/login";
        }

        return;
    }

    return Promise.reject(error.response?.data || error);
};

// ⚙️ Tạo các client riêng biệt cho từng loại
export const axiosClient = axios.create({
    baseURL: APP_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const axiosClientFile = axios.create({
    baseURL: APP_URL,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

export const axiosClientNoAuth = axios.create({
    baseURL: APP_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🧩 Gắn interceptor vào tất cả client
axiosClient.interceptors.request.use(handleRequest, handleRequestError);
axiosClient.interceptors.response.use(handleResponse, handleResponseError);

axiosClientFile.interceptors.request.use(handleRequest, handleRequestError);
axiosClientFile.interceptors.response.use(handleResponse, handleResponseError);

axiosClientNoAuth.interceptors.response.use(handleResponse, handleResponseError);
