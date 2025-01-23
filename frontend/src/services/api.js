import axios from 'axios';

// Axios örneği oluşturuluyor
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Çevre değişkeni üzerinden API URL
});

// Token'ı header'a otomatik eklemek için interceptor
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// API fonksiyonları
export const getUsers = () => API.get('/users');
export const getCurrentUser = () => API.get('/currentUser');
export const updateUser = (userId, data) => API.patch(`/users/${userId}`, data);
export const deleteUser = (userId) => API.delete(`/users/${userId}`);
export const registerUser = (data) =>
    axios.post(`${process.env.REACT_APP_API_URL}/register`, data, {
        headers: {
            // Token'i manuel olarak null bırak
            Authorization: null,
        },
    });

// Login işlemi
export const loginUser = (data) => API.post('/login', data); // Login işlemi
export const getRolePermissions = () => API.get('/role-permissions');
