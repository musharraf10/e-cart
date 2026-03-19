import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { AccountSidebar } from "../../components/account/AccountSidebar.jsx";

export function AccountLayout() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-4 md:py-8"
    >
      <div className="max-w-7xl mx-auto px-0 md:px-4">
        <div className="grid lg:grid-cols-[260px,1fr] gap-0 lg:gap-12">
          <AccountSidebar />
          <main className="min-h-[400px] px-4 lg:px-0">
            <Outlet />
          </main>
        </div>
      </div>
    </motion.div>
  );
}
