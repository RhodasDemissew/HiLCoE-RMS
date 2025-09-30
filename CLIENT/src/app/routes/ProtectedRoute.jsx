import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../../api/client.js";

export default function ProtectedRoute({ redirectTo = "/login" }) {
  const location = useLocation();
  const token = getToken();
  const role = (localStorage.getItem('userRole') || '').toLowerCase();

  if (!token) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (location.pathname.startsWith('/coordinator') && role && !role.includes('coordinator')) {
    return <Navigate to='/researcher' replace />;
  }

  if (location.pathname.startsWith('/researcher') && role.includes('coordinator')) {
    return <Navigate to='/coordinator' replace />;
  }

  return <Outlet />;
}

