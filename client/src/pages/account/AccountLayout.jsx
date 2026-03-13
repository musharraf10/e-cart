import { Outlet } from "react-router-dom";
import { AccountSidebar } from "../../components/account/AccountSidebar.jsx";

export function AccountLayout() {
  return (
    <div className="grid md:grid-cols-[220px,1fr] gap-6">
      <AccountSidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
