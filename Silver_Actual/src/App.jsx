// src/App.jsx
import { useState } from 'react';
import { Routes, Route } from 'react-router';
import './App.css';

import Home from './pages/main/home';
import Memories from './pages/main/memories';
import EventFlow from './pages/main/eventFlow';
import Registration from './pages/main/registration';
import Meetourteam from './pages/main/meetourteam';
import RoomAllocation from './pages/main/RoomAllocation'; // NEW
import ResponsiveAppBar from './components/navbar.jsx';
import Footer from './components/footer.jsx';

// USER auth
import UserLogin from './pages/main/userlogin';
import UserProtectedRoute from './components/UserProtectedRoutes';
import ApprovedRoute from './components/ApprovedRoutes'; // NEW

// ADMIN
import Login from './pages/Admin/Login.jsx';
import Dashboard from './pages/Admin/Dashboard.jsx';
import HomeManager from './pages/Admin/HomeManager.jsx';
import AdminMemories from './pages/Admin/AdminMemories.jsx';
import AdminRegistrations from './pages/Admin/Adminregisterations';
import AdminSidebar from './components/AdminSidebar.jsx';
import AdminProtectedRoute from './components/ProtectedRoute.jsx';

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-4 bg-gray-950 text-white">{children}</div>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ResponsiveAppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/eventFlow" element={<EventFlow />} />
        <Route path="/meetourteam" element={<Meetourteam />} />

        {/* USER */}
        <Route path="/login" element={<UserLogin />} />
        <Route
          path="/register"
          element={
            <UserProtectedRoute>
              <Registration />
            </UserProtectedRoute>
          }
        />
        {/* Only approved + batch 2000 can access */}
        <Route
          path="/room-allocation"
          element={
            <UserProtectedRoute>
              <ApprovedRoute>
                <RoomAllocation />
              </ApprovedRoute>
            </UserProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminLayout><Dashboard /></AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/home"
          element={
            <AdminProtectedRoute>
              <AdminLayout><HomeManager /></AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/memories"
          element={
            <AdminProtectedRoute>
              <AdminLayout><AdminMemories /></AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/registrations"
          element={
            <AdminProtectedRoute>
              <AdminLayout><AdminRegistrations /></AdminLayout>
            </AdminProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
