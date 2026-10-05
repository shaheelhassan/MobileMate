import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import POS from './pages/POS';
import Customers from './pages/Customers';
import Repairs from './pages/Repairs';
import Reports from './pages/Reports';
import StaffManagement from './pages/StaffManagement';
import Settings from './pages/Settings';
import ActivityLog from './pages/ActivityLog';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/sales" element={<POS />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/repairs" element={<Repairs />} />

          <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/activity" element={<ActivityLog />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
