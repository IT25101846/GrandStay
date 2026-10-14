import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Public pages
import HomePage from './pages/HomePage';
import VenuesPage from './pages/customer/VenuesPage';

// Customer pages
import BookingPage from './pages/customer/BookingPage';
import MyReservationsPage from './pages/customer/MyReservationsPage';
import FeedbackPage from './pages/customer/FeedbackPage';

// Staff pages
import ReservationDashboard from './pages/staff/ReservationDashboard';
import QuotationDashboard from './pages/staff/QuotationDashboard';
import FinanceDashboard from './pages/staff/FinanceDashboard';
import PromotionManagementPage from './pages/staff/PromotionManagementPage';
import VenueManagementPage from './pages/staff/VenueManagementPage';
import PackageManagementPage from './pages/staff/PackageManagementPage';
import FeedbackInquiryDashboard from './pages/staff/FeedbackInquiryDashboard';
import ManagerDashboard from './pages/staff/ManagerDashboard';
import UserManagementPage from './pages/staff/UserManagementPage';

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/venues" element={<VenuesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer */}
      <Route path="/book" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><BookingPage /></ProtectedRoute>} />
      <Route path="/my-reservations" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><MyReservationsPage /></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><FeedbackPage /></ProtectedRoute>} />

      {/* Reservation Officer */}
      <Route path="/dashboard/reservations" element={
        <ProtectedRoute allowedRoles={['RESERVATION_OFFICER', 'HOTEL_ADMIN']}>
          <ReservationDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/quotations" element={
        <ProtectedRoute allowedRoles={['RESERVATION_OFFICER', 'HOTEL_ADMIN']}>
          <QuotationDashboard />
        </ProtectedRoute>
      } />

      {/* Finance Officer */}
      <Route path="/dashboard/finance" element={
        <ProtectedRoute allowedRoles={['FINANCE_OFFICER', 'HOTEL_ADMIN']}>
          <FinanceDashboard />
        </ProtectedRoute>
      } />

      {/* Admin Venue Management */}
      <Route path="/dashboard/admin" element={
        <ProtectedRoute allowedRoles={['HOTEL_ADMIN']}>
          <VenueManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/packages" element={
        <ProtectedRoute allowedRoles={['HOTEL_ADMIN']}>
          <PackageManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/promotions" element={
        <ProtectedRoute allowedRoles={['HOTEL_ADMIN']}>
          <PromotionManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/users" element={
        <ProtectedRoute allowedRoles={['HOTEL_ADMIN']}>
          <UserManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/feedback-inquiries" element={
        <ProtectedRoute allowedRoles={['HOTEL_ADMIN', 'HOTEL_MANAGER']}>
          <FeedbackInquiryDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/manager" element={
        <ProtectedRoute allowedRoles={['HOTEL_MANAGER', 'HOTEL_ADMIN']}>
          <ManagerDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import CustomCursor from './components/CustomCursor';
import ScrollProgressBar from './components/ScrollProgressBar';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            {/* Global Smooth Luxury Cursor */}
            <CustomCursor />
            {/* Global Top Scroll Reading Progress */}
            <ScrollProgressBar />
            {/* Global Back To Top with Scroll Ring */}
            <ScrollToTop />
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

