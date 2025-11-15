import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const sendOTP = (phoneNumber) =>
  api.post('/auth/send-otp', { phoneNumber });

export const verifyOTP = (phoneNumber, otp) =>
  api.post('/auth/verify-otp', { phoneNumber, otp });

export const getProfile = () =>
  api.get('/auth/profile');

export const updateProfile = (data) =>
  api.put('/auth/profile', data);

// Salon APIs
export const getSalons = (params) =>
  api.get('/salons', { params });

export const getSalonById = (id) =>
  api.get(`/salons/${id}`);

export const getServicesBySalon = (id) =>
  api.get(`/salons/${id}/services`);

export const getAvailableSlots = (id, date) =>
  api.get(`/salons/${id}/slots`, { params: { date } });

// Booking APIs
export const createBooking = (data) =>
  api.post('/bookings', data);

export const getUserBookings = (params) =>
  api.get('/bookings', { params });

export const getBookingById = (id) =>
  api.get(`/bookings/${id}`);

export const cancelBooking = (id) =>
  api.patch(`/bookings/${id}/cancel`);

// Payment APIs
export const processPayment = (data) =>
  api.post('/payments/process', data);

export const getPaymentByBooking = (bookingId) =>
  api.get(`/payments/booking/${bookingId}`);

export default api;
