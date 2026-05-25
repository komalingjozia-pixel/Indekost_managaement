import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import KamarPage from '../pages/KamarPage.jsx';
import LaporanPage from '../pages/LaporanPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import PembayaranPage from '../pages/PembayaranPage.jsx';
import PenghuniPage from '../pages/PenghuniPage.jsx';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="penghuni" element={<PenghuniPage />} />
        <Route path="kamar" element={<KamarPage />} />
        <Route path="pembayaran" element={<PembayaranPage />} />
        <Route path="laporan" element={<LaporanPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
