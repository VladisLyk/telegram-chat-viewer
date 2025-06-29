import axios from "axios";
import UserStorage from "./user";

axios.defaults.baseURL = "http://localhost:8000/";
axios.defaults.withCredentials = true
const protectedRoutes = ['telegram']

export const api = axios;

api.interceptors.request.use(
    (config) => {
        const accessToken = UserStorage.getUserData()?.accessToken;
        if (!accessToken) return config;

        const isProtected = protectedRoutes.some(route => config.url.includes(route));
        if (isProtected) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                const res = await api.post("auth/refresh", null, {
                    withCredentials: true,
                });

                UserStorage.updateUserField("accessToken", res.data.access_token)
                originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;

                return api(originalRequest);
            } catch (refreshError) {
                console.error("Не вдалося оновити токен:", refreshError);
            }
        }

        return Promise.reject(error);
    }
);
