import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token ke setiap request jika tersedia
axiosClient.interceptors.request.use((config) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const token = currentUser?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
