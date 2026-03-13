import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export function ProtectedRoute() {
  const { token, isInitializing } = useSelector((s) => s.auth);
  const location = useLocation();

  if (isInitializing) {
    return <div className="text-sm text-gray-500">Restoring session…</div>;
  }

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
