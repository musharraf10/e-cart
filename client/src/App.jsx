import { useEffect, useMemo, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useDispatch } from "react-redux";

import { Layout } from "./components/layout/Layout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { ShopPage } from "./pages/ShopPage.jsx";
import { SearchPage } from "./pages/SearchPage.jsx";
import { ProductDetailPage } from "./pages/ProductDetailPage.jsx";
import { CartPage } from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import { SuccessPage } from "./pages/SuccessPage.jsx";
import { CancelPage } from "./pages/CancelPage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { VerifyEmailPage } from "./pages/VerifyEmailPage.jsx";
import { ResetPasswordPage } from "./pages/ResetPasswordPage.jsx";
import { TermsPage } from "./pages/TermsPage.jsx";
import { PrivacyPage } from "./pages/PrivacyPage.jsx";
import { SupportPage } from "./pages/SupportPage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";

import { ProtectedRoute } from "./components/routes/ProtectedRoute.jsx";
import { AdminRoute } from "./components/routes/AdminRoute.jsx";

import { AccountLayout } from "./pages/account/AccountLayout.jsx";
import { ProfilePage } from "./pages/account/ProfilePage.jsx";
import { AddressPage } from "./pages/account/AddressPage.jsx";
import { OrdersPage } from "./pages/account/OrdersPage.jsx";
import { OrderDetailsPage } from "./pages/account/OrderDetailsPage.jsx";
import { WishlistPage } from "./pages/account/WishlistPage.jsx";
import { AccountSettingsPage } from "./pages/account/AccountSettingsPage.jsx";
import { AccountPage } from "./pages/AccountPage.jsx";
import { OrderStatusPage } from "./pages/OrderStatusPage.jsx";
import { CheckoutResumePage } from "./pages/CheckoutResumePage.jsx";

import { AdminOpsLayout } from "./pages/admin/ops/AdminOpsLayout.jsx";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage.jsx";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage.jsx";
import { AdminProductFormPage } from "./pages/admin/AdminProductFormPage.jsx";
import { AdminInventoryPage } from "./pages/admin/ops/AdminInventoryPage.jsx";
import { AdminOrdersPage } from "./pages/admin/ops/AdminOrdersPage.jsx";
import { AdminCustomersPage } from "./pages/admin/ops/AdminCustomersPage.jsx";
import { AdminReviewsPage } from "./pages/admin/ops/AdminReviewsPage.jsx";
import { AdminCouponsPage } from "./pages/admin/ops/AdminCouponsPage.jsx";
import { AdminDropsPage } from "./pages/admin/ops/AdminDropsPage.jsx";
import { AdminReturnsPage } from "./pages/admin/ops/AdminReturnsPage.jsx";
import { AdminAnalyticsPage } from "./pages/admin/ops/AdminAnalyticsPage.jsx";
import { AdminAnnouncementsPage } from "./pages/admin/ops/AdminAnnouncementsPage.jsx";
import { AdminSettingsPage } from "./pages/admin/ops/AdminSettingsPage.jsx";

import { initializeAuth } from "./store/slices/authSlice.js";
import { ToastProvider, useToast } from "./components/ui/ToastProvider.jsx";
import { DesktopBlockScreen } from "./components/layout/DesktopBlockScreen.jsx";
import { activateWaitingServiceWorker } from "./pwa/register-sw.js";

function AppShell() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { notify } = useToast();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : true
  );
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [installOutcome, setInstallOutcome] = useState(null);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleSwUpdateAvailable = (event) => {
      const registration = event.detail?.registration;
      notify("A new version is available.", "success", {
        duration: 8000,
        actionLabel: "Reload",
        onAction: () => activateWaitingServiceWorker(registration),
      });
    };

    const handleSwActivated = (event) => {
      const version = event.detail?.version;
      if (version) {
        notify(`App updated (${version}).`, "success");
      }
    };

    window.addEventListener("sw:update-available", handleSwUpdateAvailable);
    window.addEventListener("sw:activated", handleSwActivated);

    return () => {
      window.removeEventListener("sw:update-available", handleSwUpdateAvailable);
      window.removeEventListener("sw:activated", handleSwActivated);
    };
  }, [notify]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    const handleAppInstalled = () => {
      setInstallOutcome("accepted");
      setInstallPromptEvent(null);
      notify("App installed successfully.", "success");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [notify]);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;

    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    setInstallOutcome(outcome);
    setInstallPromptEvent(null);

    notify(
      outcome === "accepted" ? "Install started." : "Install dismissed.",
      outcome === "accepted" ? "success" : "error",
    );
  };

  const isAdminRoute = location.pathname.startsWith("/admin");

  const isDesktopBlocked = useMemo(
    () => !isMobile && !isAdminRoute,
    [isMobile, isAdminRoute]
  );

  if (isDesktopBlocked && !location.pathname.startsWith("/auth") && !location.pathname.startsWith("/login")) {
    return <DesktopBlockScreen />;
  }

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/resume/:orderId" element={<CheckoutResumePage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Authenticated user routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/order-status/:orderId" element={<OrderStatusPage />} />

          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<AccountPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="addresses" element={<AddressPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailsPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="settings" element={<AccountSettingsPage />} />
          </Route>
        </Route>

        {/* Admin routes – protected by AdminRoute */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminOpsLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/edit/:id" element={<AdminProductFormPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="announcements" element={<AdminAnnouncementsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="drops" element={<AdminDropsPage />} />
            <Route path="returns" element={<AdminReturnsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* Optional: 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {installPromptEvent ? (
        <div className="fixed inset-x-3 bottom-20 z-[70] rounded-2xl border border-border bg-card/95 p-3 shadow-card backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Install NoorFit</p>
              <p className="text-xs text-muted-foreground">Get faster access and offline browsing.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground"
                onClick={() => {
                  setInstallOutcome("dismissed");
                  setInstallPromptEvent(null);
                }}
              >
                Not now
              </button>
              <button
                type="button"
                className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-background"
                onClick={handleInstallClick}
              >
                Install
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {installOutcome ? (
        <div className="fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground">
          Install outcome: {installOutcome}
        </div>
      ) : null}
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
