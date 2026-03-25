import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../../../components/admin/AdminSidebar.jsx";

export function AdminOpsLayout() {
  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[260px,1fr] lg:gap-8">
          <AdminSidebar />
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
