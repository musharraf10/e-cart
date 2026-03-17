import { useLocation } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";

export function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-primary">
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:py-8 pb-[calc(6rem+env(safe-area-inset-bottom,0))] md:pb-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
