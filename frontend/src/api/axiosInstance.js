import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true, // ✅ critical for JWT cookie auth
});

export default axiosInstance;
