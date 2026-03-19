import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { DesktopBlockScreen } from "./DesktopBlockScreen.jsx";

export function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const user = useSelector((s) => s.auth.user);
  const isAdmin = user?.role === "admin";
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(Boolean(mql.matches));
    onChange();
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-primary w-full max-w-full overflow-x-hidden">
        <main className="flex-1 flex items-center justify-center p-4 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    );
  }

  if (isDesktop) {
    const isAdminRoute = location.pathname.startsWith("/admin");
    if (!isAdmin || !isAdminRoute) {
      return <DesktopBlockScreen />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary w-full max-w-full overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full max-w-full px-4 py-4 md:py-8 pb-[calc(6rem+env(safe-area-inset-bottom,0))] md:pb-8">
        {children}
        </div>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
