import { Outlet } from "react-router-dom";
import { AccountSidebar } from "../../components/account/AccountSidebar.jsx";

export function AccountLayout() {
  return (
    <div className="grid md:grid-cols-[250px,1fr] gap-6">
      <div className="hidden md:block">
        <AccountSidebar />
      </div>
      <main className="space-y-4">
        <div className="md:hidden">
          <AccountSidebar />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
