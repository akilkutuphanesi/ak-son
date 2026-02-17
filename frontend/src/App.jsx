import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyQuestions from './pages/MyQuestions';
import ProfileSettings from './pages/ProfileSettings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ana sayfa artık Welcome sayfası */}
        <Route path="/" element={<Welcome />} />
        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Yeni oluşturduğumuz yan sayfalar */}
        <Route path="/questions" element={<MyQuestions />} />
        <Route path="/profile" element={<ProfileSettings />} />
      </Routes>
    </Router>
  );
}

export default App;