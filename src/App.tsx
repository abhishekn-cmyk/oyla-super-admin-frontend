import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from './components/sidebar/Sidebar';

import Login from './pages/Auth/Login';
import Users from "./pages/Users/Users";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Carousel from "./pages/Carousel/Carousel";
import Success from "./pages/SuccessStoreis/Success";
import Language from "./pages/Language/Language";
import Freeze from "./pages/Freeze/Freeze";
import Contact from "./pages/ContactUs/Contact";
import Subscription from "./pages/subscriptions/Subscriptions";
import Rewards from "./pages/Rewards/Rewards";
import UserWallet from "./pages/UserWallet/UserWallet";
import Restaurant from "./pages/Restaurant/Restaurant";
import Cart from "./pages/Cart/Cart";
import Product from "./pages/Product/Product";
import Program from "./pages/Program/Program";
import Privacy from "./pages/Privacy/Privacy";
import Settings from "./pages/Settings/Settings";
import Orders from "./pages/Orders/Order";
import type { ReactElement } from "react";
// import MainDashboard from "./pages/Home/MainDashboard";
import Home from "./pages/Home/Home";

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();

  // Show Sidebar only if NOT on login page
  const showSidebar = location.pathname !== "/login";

  return (
    <>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <div className="flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 bg-gray-100 p-4 md:p-8 overflow-x-hidden">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/carousel"
              element={
                <ProtectedRoute>
                  <Carousel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/success"
              element={
                <ProtectedRoute>
                  <Success />
                </ProtectedRoute>
              }
            />
            <Route
              path="/language"
              element={
                <ProtectedRoute>
                  <Language />
                </ProtectedRoute>
              }
            />
            <Route
              path="/freeze"
              element={
                <ProtectedRoute>
                  <Freeze />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <ProtectedRoute>
                  <Contact />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <Rewards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userwallet"
              element={
                <ProtectedRoute>
                  <UserWallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restarunt"
              element={
                <ProtectedRoute>
                  <Restaurant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product"
              element={
                <ProtectedRoute>
                  <Product />
                </ProtectedRoute>
              }
            />
            <Route
              path="/program"
              element={
                <ProtectedRoute>
                  <Program />
                </ProtectedRoute>
              }
            />
            <Route
              path="/privacy"
              element={
                <ProtectedRoute>
                  <Privacy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            {/* Login route is public */}
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
