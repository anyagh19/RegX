import axios from "axios";
import { store } from "./src/app/store";
import { addAccessToken, removeAccessToken } from "./src/features/auth/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKENDURL || "https://localhost:7099/api",
  withCredentials: true,
});

// Attach access token
api.interceptors.request.use(config => {
  if (config.url?.includes("/refresh-tokens")) return config;

  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request and wait for the refresh to finish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/User/refresh-tokens");
        const newToken = data.accessToken;
        
        store.dispatch(addAccessToken(newToken));
        processQueue(null, newToken); // Resolve all queued requests
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null); // Reject all queued requests
        store.dispatch(removeAccessToken());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
