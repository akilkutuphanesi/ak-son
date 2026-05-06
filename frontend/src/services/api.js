import axios from 'axios';

// FastAPI backend — port 8000 (uvicorn)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
    withCredentials: false,
});

// Her istekte localStorage'daki JWT token'ı otomatik ekle
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 401 geldiğinde token'ı temizle (süresi dolmuş)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;