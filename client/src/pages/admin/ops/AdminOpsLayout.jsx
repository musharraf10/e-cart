import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../../../components/admin/AdminSidebar.jsx";

export function AdminOpsLayout() {
  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:py-8">
        <div className="grid gap-4 lg:grid-cols-[280px,1fr] lg:gap-8">
          <AdminSidebar />
          <main className="min-w-0 rounded-2xl border border-border/70 bg-primary/60 p-3 sm:p-4 md:p-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
