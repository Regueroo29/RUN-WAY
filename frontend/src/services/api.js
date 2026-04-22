import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach token
// API.interceptors.request.use(
//   (config) => {
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       const user = JSON.parse(userData);
//       if (user.token) {
//         config.headers.Authorization = `Bearer ${user.token}`;
//       }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Add response interceptor to handle 401s
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;