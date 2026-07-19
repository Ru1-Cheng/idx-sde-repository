import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// Fetch property list
export async function fetchProperties(params = {}) {
  try {
    const response = await api.get("/properties", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch properties."
    );
  }
}

// Fetch one property
export async function fetchProperty(id) {
  try {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch property."
    );
  }
}

// Fetch open houses
export async function fetchOpenHouses(id) {
  try {
    const response = await api.get(`/properties/${id}/openhouses`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch open houses."
    );
  }
}

export default api;