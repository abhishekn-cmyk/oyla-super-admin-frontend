import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000", // your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // adjust key if needed
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
