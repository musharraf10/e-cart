import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Layout } from "./components/layout/Layout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { SearchPage } from "./pages/SearchPage.jsx";
import { ProductDetailPage } from "./pages/ProductDetailPage.jsx";
import { CartPage } from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import { SuccessPage } from "./pages/SuccessPage.jsx";
import { CancelPage } from "./pages/CancelPage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage.jsx";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage.jsx";
import { AdminProductFormPage } from "./pages/admin/AdminProductFormPage.jsx";
import { AdminOpsLayout } from "./pages/admin/ops/AdminOpsLayout.jsx";
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
import { ProtectedRoute } from "./components/routes/ProtectedRoute.jsx";
import { AdminRoute } from "./components/routes/AdminRoute.jsx";
import { initializeAuth } from "./store/slices/authSlice.js";
import { AccountLayout } from "./pages/account/AccountLayout.jsx";
import { ProfilePage } from "./pages/account/ProfilePage.jsx";
import { AddressPage } from "./pages/account/AddressPage.jsx";
import { OrdersPage } from "./pages/account/OrdersPage.jsx";
import { OrderDetailsPage } from "./pages/account/OrderDetailsPage.jsx";
import { WishlistPage } from "./pages/account/WishlistPage.jsx";
import { AccountSettingsPage } from "./pages/account/AccountSettingsPage.jsx";
import { AccountPage } from "./pages/AccountPage.jsx";
import { ToastProvider } from "./components/ui/ToastProvider.jsx";

export default function App() {
  const dispatch = useDispatch();
  const [isDesktopBlocked, setIsDesktopBlocked] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false,
  );

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => setIsDesktopBlocked(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isDesktopBlocked) {
    return (
      <ToastProvider>
        <div className="flex min-h-screen items-center justify-center bg-primary px-6 text-center">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card">
            <p className="text-sm uppercase tracking-[0.25em] text-accent">NoorFit</p>
            <h1 className="mt-4 text-3xl font-semibold text-white">
              This app is optimized for mobile devices.
            </h1>
            <p className="mt-4 text-sm text-muted">
              Please open on your phone.
            </p>
          </div>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<Navigate to="/" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<AccountPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="addresses" element={<AddressPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailsPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="settings" element={<AccountSettingsPage />} />
            </Route>

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

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/products/new" element={<AdminProductFormPage />} />
              <Route path="/admin/products/edit/:id" element={<AdminProductFormPage />} />
            </Route>
          </Route>
        </Routes>
      </Layout>
    </ToastProvider>
  );
}
