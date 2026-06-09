import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080", // Alamat Backend lu
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
