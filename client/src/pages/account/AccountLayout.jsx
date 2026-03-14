import { Outlet } from "react-router-dom";
import { AccountSidebar } from "../../components/account/AccountSidebar.jsx";

export function AccountLayout() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-[260px,1fr] gap-8">
          <AccountSidebar />
          <main className="min-h-[600px]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
