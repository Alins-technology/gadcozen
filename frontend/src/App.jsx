import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainLayout from "./layouts/MainLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import PageLoader from "./components/PageLoader.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Shop = lazy(() => import("./pages/Shop.jsx"));
const CategoryPage = lazy(() => import("./pages/CategoryPage.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const Wishlist = lazy(() => import("./pages/Wishlist.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation.jsx"));
const Account = lazy(() => import("./pages/account/Account.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const FAQ = lazy(() => import("./pages/FAQ.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const ShippingPolicy = lazy(() => import("./pages/legal/ShippingPolicy.jsx"));
const ReturnRefundPolicy = lazy(() => import("./pages/legal/ReturnRefundPolicy.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy.jsx"));
const TermsAndConditions = lazy(() => import("./pages/legal/TermsAndConditions.jsx"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy.jsx"));
const Disclaimer = lazy(() => import("./pages/legal/Disclaimer.jsx"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.jsx"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm.jsx"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories.jsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.jsx"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.jsx"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews.jsx"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons.jsx"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts.jsx"));
const AdminSubscribers = lazy(() => import("./pages/admin/AdminSubscribers.jsx"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.jsx"));

function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-confirmation/:orderNumber"
                element={
                  <ProtectedRoute>
                    <OrderConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account/*"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="subscribers" element={<AdminSubscribers />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}

export default App;
