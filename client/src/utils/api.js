// src/utils/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ecotrack19.onrender.com/api', // Update if your backend runs elsewhere
  withCredentials: true, // Ensures cookies are sent with requests (for token/session auth)
});

// OPTIONAL: Add this if you’re using token-based auth (like JWT)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
