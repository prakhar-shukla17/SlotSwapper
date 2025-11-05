import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true, // ✅ critical for JWT cookie auth
});

export default axiosInstance;
