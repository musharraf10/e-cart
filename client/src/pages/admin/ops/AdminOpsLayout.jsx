import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../../../components/admin/AdminSidebar.jsx";

export function AdminOpsLayout() {
  return (
    <div className="grid lg:grid-cols-[280px,1fr] gap-6">
      <AdminSidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
