import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import MainNavbar from './pages/NavBar'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import { LanguageProvider } from './Providers/LangugeProvider'
import './Styles/customStyles.css';
import UserProfile from './pages/UserProfile'
import ProductsPage from './pages/ProductPage'
import Register from './pages/Register'
import Login from './pages/Login'
import { CartProvider } from './context/CartContext';
import { WishListProvider } from './context/WishListContext';
import WishListPage from './pages/WishListPage'
// import CartPage from './pages/CartPage'
// import ConfirmOrderPage from './pages/OrderConfimation';
import AdminLayout from './pages/Admin/AdminLayout';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductForm from './pages/Admin/Products/ProductsForm'
import AdminProductsDash from './pages/Admin/Products/AdminProductDash'
import PaymentsSection from './pages/Admin/Payments/PaymentsSection'
import NotificationWrapper from './pages/NotificationWarapper'
import AdminEditProduct from './pages/Admin/Products/ِAdminEditProduct'
import CheckoutPage from './pages/CheckoutPage'
import MainLayout from './layouts/MainLayout'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'



interface OneSignalType {
  push: (...args: unknown[]) => void;
  init: (options: {
    appId: string;
    notifyButton?: { enable: boolean };
    safari_web_id?: string;
    [key: string]: unknown;
  }) => void;
  on: (event: "subscriptionChange", callback: (isSubscribed: boolean) => void) => void;
  getUserId: () => Promise<string | null>;
}

declare global {
  interface Window {
    OneSignal: OneSignalType;
  }
}

const backendURL = import.meta.env.VITE_BACKEND_URL;

const initOneSignal = () => {
  window.OneSignal = window.OneSignal || [];
  window.OneSignal.push(function () {
    window.OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID, // استبدليه بتاعك
    });

    // بعد ما يتفعل، خدي الـ playerId
    window.OneSignal.on('subscriptionChange', async function (isSubscribed: boolean) {
      if (isSubscribed) {
        const playerId = await window.OneSignal.getUserId();
        console.log("playerId: ", playerId);

   
        fetch(`${backendURL}/users/playerId`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("linecoffeeToken")}`
          },
          body: JSON.stringify({ playerId }),
        });
      }
    });
  });
};




function App() {
  const { i18n } = useTranslation();
  useEffect(() => {
    initOneSignal();
  }, []);

  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <>
      <ToastContainer />
        <LanguageProvider>
        <WishListProvider>
          <CartProvider>
          <BrowserRouter>
        <MainNavbar />
              <div id="appsWar">
                <Routes>
            
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/product/:productId" element={<ProductDetails />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/profile/notifications" element={<NotificationWrapper />} />
                    <Route path="/wishlist" element={<WishListPage />} />
                    <Route path="/cart" element={<CheckoutPage />} />
                  </Route>

                    {/* admin */}
                    <Route path="/admin/" element={<AdminLayout />} />
                    <Route path="/admin/products" element={<AdminProductsDash />} />
                    <Route path="/admin/add-product" element={<ProductForm onBack={() => window.history.back()} />} />
                    <Route path="/admin/edit-product/:productId" element={<AdminEditProduct />} />
                    <Route path="/admin/payments" element={<PaymentsSection />} />
                  
                </Routes>

        </div>
      </BrowserRouter>
          </CartProvider>
        </WishListProvider>
        </LanguageProvider>
      
      
      
    </>

  )
}

export default App
