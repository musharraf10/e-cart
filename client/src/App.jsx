import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Layout } from "./components/layout/Layout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { ProductDetailPage } from "./pages/ProductDetailPage.jsx";
import { CartPage } from "./pages/CartPage.jsx";
import { CheckoutPage } from "./pages/CheckoutPage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { AccountPage } from "./pages/AccountPage.jsx";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage.jsx";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage.jsx";
import { AdminProductFormPage } from "./pages/admin/AdminProductFormPage.jsx";
import { ProtectedRoute } from "./components/routes/ProtectedRoute.jsx";
import { AdminRoute } from "./components/routes/AdminRoute.jsx";
import { initializeAuth } from "./store/slices/authSlice.js";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/account/*" element={<AccountPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/products/new" element={<AdminProductFormPage />} />
          </Route>
        </Route>
      </Routes>
    </Layout>
  );
}
