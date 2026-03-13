import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export function AdminRoute() {
  const { user, isInitializing } = useSelector((s) => s.auth);

  if (isInitializing) {
    return <div className="text-sm text-gray-500">Checking admin access…</div>;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
