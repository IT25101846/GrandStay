import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to every request automatically and ensure single /api/v1 prefix
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.url && !/^https?:\/\//.test(config.url)) {
      const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
      if (!path.startsWith('/api/v1')) {
        config.url = `/api/v1${path}`;
      } else {
        config.url = path;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: normalize certain errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Clear local auth on 401 so app can react and prompt login again
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  },
);

// Auth endpoints
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// User management endpoints (Admin)
export const userApi = {
  getAll: () => api.get('/users'),
  updateRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
};

// Venue endpoints
export const venueApi = {
  getAll: () => api.get('/venues'),
  getById: (id) => api.get(`/venues/${id}`),
  create: (data) => api.post('/venues', data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  delete: (id) => api.delete(`/venues/${id}`),
};

// Package endpoints
export const packageApi = {
  getAll: () => api.get('/packages'),
  getById: (id) => api.get(`/packages/${id}`),
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
};

// Reservation endpoints
export const reservationApi = {
  create: (data) => api.post('/reservations', data),
  getMyReservations: () => api.get('/reservations/my'),
  getAll: () => api.get('/reservations'),
  getById: (id) => api.get(`/reservations/${id}`),
  updateStatus: (id, status, remarks) => api.put(`/reservations/${id}/status`, { status, remarks }),
  cancel: (id) => api.put(`/reservations/${id}/cancel`),
  /**
   * Returns an array of date strings ("yyyy-MM-dd") that are already booked
   * for the specified venue.  Used by the BookingPage date picker to disable
   * unavailable days before the customer submits a reservation.
   */
  getUnavailableDates: (venueId) => api.get(`/reservations/unavailable-dates?venueId=${venueId}`),
};


// Quotation endpoints
export const quotationApi = {
  create: (data) => api.post('/quotations', data),
  getByReservation: (reservationId) => api.get(`/quotations/reservation/${reservationId}`),
  updateStatus: (id, status) => api.put(`/quotations/${id}/status`, { status }),
};

// Payment endpoints
export const paymentApi = {
  record: (data) => api.post('/payments', data),
  getByReservation: (reservationId) => api.get(`/payments/reservation/${reservationId}`),
};

// Addon endpoints
export const addonApi = {
  getAll: () => api.get('/addons'),
};

export default api;

