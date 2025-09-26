import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from './components/sidebar/Sidebar';
import Home from './pages/Home/Home';
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
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/users" element={<Users />} />
            <Route path="/carousel" element={<Carousel />} />
            <Route path="/success" element={<Success />} />
            <Route path="/language" element={<Language />} />
            <Route path="/freeze" element={<Freeze />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/userwallet" element={<UserWallet />} />
            <Route path="/restarunt" element={<Restaurant />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product" element={<Product />} />
            <Route path="/program" element={<Program />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/settings" element={<Settings />} />
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
