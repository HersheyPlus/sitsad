// src/services/axios.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BACKEND_BASE_URL}`, // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;