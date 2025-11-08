import { useState } from 'react';
import { Routes, Route } from 'react-router';
import './App.css';

import Home from './pages/main/home';
import Memories from './pages/main/memories';
import EventFlow from './pages/main/eventFlow';
import Registration from './pages/main/registration';
import Meetourteam from './pages/main/meetourteam';
import ResponsiveAppBar from './components/navbar.jsx';
import Footer from './components/footer.jsx';

// USER auth
import UserLogin from './pages/main/userlogin';
import UserProtectedRoute from './components/UserProtectedRoutes';

// ADMIN auth (existing)
import Login from './pages/Admin/Login.jsx';
import Dashboard from './pages/Admin/Dashboard.jsx';
import HomeManager from './pages/Admin/HomeManager.jsx';
import AdminMemories from './pages/Admin/AdminMemories.jsx';
import AdminSidebar from './components/AdminSidebar.jsx';
import AdminProtectedRoute from './components/ProtectedRoute.jsx';

// Admin layout wrapper
function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      {/* 🌐 Main Website */}
      <ResponsiveAppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/eventFlow" element={<EventFlow />} />
        <Route path="/meetourteam" element={<Meetourteam />} />

        {/* USER auth */}
        <Route path="/login" element={<UserLogin />} />
        <Route
          path="/register"
          element={
            <UserProtectedRoute>
              <Registration />
            </UserProtectedRoute>
          }
        />

        {/* 🛠 Admin Panel Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/home"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <HomeManager />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/memories"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminMemories />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
