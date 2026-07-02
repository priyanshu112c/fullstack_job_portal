import axios from "axios"

let store;

export const injectStore = (_store) => {
    store = _store;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
})

let failedQueue = [];
let isRefreshing = false;

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use((config) => {
    if (!store) return config;
    const token = store.getState().auth.accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== "/auth/refresh-token"
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { default: authService } = await import("../services/authService");
                const response = await authService.refreshToken();
                const newToken = response.data.accessToken;
                const { hasCompany, user: refreshedUser } = response.data;

                const { setCredentials } = await import("../redux/slices/authSlice");
                const currentUser = store.getState().auth.user;
                const currentRole = store.getState().auth.role;
                store.dispatch(setCredentials({ user: refreshedUser || currentUser, accessToken: newToken, role: currentRole, hasCompany }));

                processQueue(null, newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                const { logout } = await import("../redux/slices/authSlice");
                store.dispatch(logout());
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;