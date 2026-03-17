import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../../../components/admin/AdminSidebar.jsx";

export function AdminOpsLayout() {
  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-[280px,1fr] gap-6 lg:gap-8">
          <AdminSidebar />
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
