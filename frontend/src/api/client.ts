import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: API_BASE_URL });

// Attach the admin JWT (if present) to every request automatically.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("meghnetra_admin_token");
  if (token) {
    config.headers = config.headers || ({} as any);
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
