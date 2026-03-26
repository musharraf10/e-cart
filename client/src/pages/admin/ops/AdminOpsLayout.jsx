import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../../../components/admin/AdminSidebar.jsx";

export function AdminOpsLayout() {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-primary">
      <aside className="hidden md:flex w-64 flex-shrink-0 h-full border-r border-border bg-primary">
        <AdminSidebar />
      </aside>

      <main className="flex-1 h-full overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
