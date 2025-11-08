import { Navigate, useLocation } from "react-router-dom";

const UserProtectedRoute = ({ children }) => {
  const location = useLocation();
  const raw = localStorage.getItem("app_auth"); // { token, user }
  const token = raw ? JSON.parse(raw)?.token : null;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

export default UserProtectedRoute;
