import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://10.104.171.222:8000/api/v1'
  : 'https://your-production-api.com/api/v1';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 10000,
});


api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ AUTH FUNCTIONS ============
export const authFunctions = {
  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      if (response.data.success && response.data.data.token) {
        await SecureStore.setItemAsync('auth_token', response.data.data.token);
        await SecureStore.setItemAsync('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.success && response.data.data.token) {
        await SecureStore.setItemAsync('auth_token', response.data.data.token);
        await SecureStore.setItemAsync('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user');
    }
  },

  getCurrentUser: async () => {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};

// ============ COSTUME FUNCTIONS ============
export const costumeFunctions = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/costumes', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching costumes:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/costumes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching costume:', error);
      throw error;
    }
  },

  getAvailableDates: async (id, startDate, endDate) => {
    try {
      const response = await api.get(`/costumes/${id}/available-dates`, {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available dates:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/costumes/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

// ============ RENTAL FUNCTIONS ============
export const rentalFunctions = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/rentals', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching rentals:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/rentals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rental:', error);
      throw error;
    }
  },

  create: async (rentalData) => {
    try {
      const formattedData = {
        ...rentalData,
        costume_id: parseInt(rentalData.costume_id),
        start_date: rentalData.start_date?.split('T')[0] || rentalData.start_date,
        end_date: rentalData.end_date?.split('T')[0] || rentalData.end_date,
      };
      const response = await api.post('/rentals', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating rental:', error);
      if (error.response?.data) {
        error.validationErrors = error.response.data.errors;
        error.message = error.response.data.message || 'Unable to create rental';
      }
      throw error;
    }
  },

  cancel: async (id) => {
    try {
      const response = await api.patch(`/rentals/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling rental:', error);
      throw error;
    }
  },
};

// ============ ADMIN FUNCTIONS ============
export const adminFunctions = {
  // Costumes
  getCostumes: async () => {
    try {
      const response = await api.get('/admin/costumes');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin costumes:', error);
      throw error;
    }
  },

  createCostume: async (costumeData) => {
    try {
      const response = await api.post('/admin/costumes', costumeData);
      return response.data;
    } catch (error) {
      console.error('Error creating costume:', error);
      throw error;
    }
  },

  updateCostume: async (id, costumeData) => {
    try {
      // Multipart uploads must use POST (PHP doesn't parse $_FILES for PUT/PATCH reliably)
      const response = costumeData instanceof FormData
        ? await api.post(`/admin/costumes/${id}`, costumeData)
        : await api.put(`/admin/costumes/${id}`, costumeData);
      return response.data;
    } catch (error) {
      console.error('Error updating costume:', error);
      throw error;
    }
  },

  deleteCostume: async (id) => {
    try {
      const response = await api.delete(`/admin/costumes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting costume:', error);
      throw error;
    }
  },

  togglePublish: async (id) => {
    try {
      const response = await api.patch(`/admin/costumes/${id}/toggle-publish`);
      return response.data;
    } catch (error) {
      console.error('Error toggling publish:', error);
      throw error;
    }
  },

  // Rentals
  getRentals: async () => {
    try {
      const response = await api.get('/admin/rentals');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin rentals:', error);
      throw error;
    }
  },

  getRental: async (id) => {
    try {
      const response = await api.get(`/admin/rentals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rental:', error);
      throw error;
    }
  },

  updateRentalStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/rentals/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating rental status:', error);
      throw error;
    }
  },
};

export default api;
