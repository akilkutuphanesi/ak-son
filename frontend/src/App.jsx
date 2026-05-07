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
import ForgotPassword from './pages/ForgotPassword';

// Çalışma Odaları
import StudyRooms from './pages/StudyRooms';
import StudyRoomDetail from './pages/StudyRoomDetail';
import StudyRoomsAdminTab from './pages/admin/StudyRoomsAdminTab';
import DynamicCardsDemo from './pages/DynamicCardsDemo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/study-rooms" element={<StudyRooms />} />
        <Route path="/study-rooms/:id" element={<StudyRoomDetail />} />
        <Route path="/cards-demo" element={<DynamicCardsDemo />} />

        {/* NESTED ADMIN ROTALARI */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Default olarak /admin girilince DashboardTab açılsın */}
          <Route index element={<DashboardTab />} />
          <Route path="users" element={<UsersTab />} />
          <Route path="content" element={<ContentTab />} />
          <Route path="settings" element={<SettingsTab />} />
          <Route path="reports"  element={<ReportsTab />} />
          <Route path="rooms"    element={<StudyRoomsAdminTab />} />
          {/* Raporlar için ayrı sayfa yapmadık, Settings veya Dashboard'a yönlendirebilirsin veya "reports" linkini AdminLayout'tan silebilirsin */}
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;