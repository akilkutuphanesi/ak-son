import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Admin Sayfaları
import AdminLayout from './pages/admin/AdminLayout';
import DashboardTab from './pages/admin/DashboardTab';
import UsersTab from './pages/admin/UsersTab';
import ContentTab from './pages/admin/ContentTab';
import SettingsTab from './pages/admin/SettingsTab';
import ReportsTab from './pages/admin/ReportsTab';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* NESTED ADMIN ROTALARI */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Default olarak /admin girilince DashboardTab açılsın */}
          <Route index element={<DashboardTab />} />
          <Route path="users" element={<UsersTab />} />
          <Route path="content" element={<ContentTab />} />
          <Route path="settings" element={<SettingsTab />} />
          <Route path="reports" element={<ReportsTab />} />
          {/* Raporlar için ayrı sayfa yapmadık, Settings veya Dashboard'a yönlendirebilirsin veya "reports" linkini AdminLayout'tan silebilirsin */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;