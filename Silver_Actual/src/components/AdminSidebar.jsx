import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav className="flex flex-col space-y-2">
        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "bg-gray-700 p-2 rounded" : "p-2 rounded hover:bg-gray-700"}>Dashboard</NavLink>
        <NavLink to="/admin/home" className={({ isActive }) => isActive ? "bg-gray-700 p-2 rounded" : "p-2 rounded hover:bg-gray-700"}>Home Manager</NavLink>
        <NavLink to="/admin/memories" className={({ isActive }) => isActive ? "bg-gray-700 p-2 rounded" : "p-2 rounded hover:bg-gray-700"}>Memories</NavLink>
        {/* NEW */}
        <NavLink to="/admin/registrations" className={({ isActive }) => isActive ? "bg-gray-700 p-2 rounded" : "p-2 rounded hover:bg-gray-700"}>Registrations</NavLink>

        <button onClick={handleLogout} className="mt-auto bg-red-600 hover:bg-red-700 p-2 rounded">Logout</button>
      </nav>
    </div>
  );
};

export default AdminSidebar;
