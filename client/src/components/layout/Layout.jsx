import { useLocation } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { AnnouncementBar } from "./AnnouncementBar.jsx";

export function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-primary w-full max-w-full overflow-x-hidden">
        <main className="flex-1 flex items-center justify-center p-4 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-primary w-full max-w-full overflow-x-hidden">
      {!location.pathname.startsWith("/admin") && <AnnouncementBar />}
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
