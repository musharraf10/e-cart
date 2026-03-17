import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { AccountSidebar } from "../../components/account/AccountSidebar.jsx";

export function AccountLayout() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-6 md:py-8"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-[260px,1fr] gap-8 lg:gap-12">
          <AccountSidebar />
          <main className="min-h-[400px]">
            <Outlet />
          </main>
        </div>
      </div>
    </motion.div>
  );
}
