import { useLocation } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { MobileBottomNav } from "./MobileBottomNav.jsx";

export function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      {!isAuthPage && <Header />}
      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 ${isAuthPage ? "py-8" : "py-6 pb-24 md:pb-8"}`}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
}
