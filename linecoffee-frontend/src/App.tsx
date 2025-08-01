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





function App() {
  const { i18n } = useTranslation();
  useEffect(() => {
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
