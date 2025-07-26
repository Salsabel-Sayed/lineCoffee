
import { useState } from "react";
import OrdersSection from "./Orders/OrdersSection";
import UsersSection from "./Users.tsx/UsersSection";
import WalletsSection from "./WalletsCoins/WalletsCoinsSection";
import UserReportsSection from "./Reports/ReportsSection";
import NotificationsSection from "./Notifications/NotificationsSection";
import CategoriesList from "./Categories/CategoriesList";
import PaymentsSection from "./Payments/PaymentsSection";
import AdminProductList from "./Products/AdminProductsList";
import AdminCouponsSection from "./Coupons/AdminCouponsSection";

export default function AdminLayout() {
    const [activeSection, setActiveSection] = useState("products");

    const renderSection = () => {
        switch (activeSection) {
            case "products":
                return <AdminProductList />;
            case "categories":
                return <CategoriesList />;
            case "orders":
                return <OrdersSection />;
            case "users":
                return <UsersSection />;
            case "walletsCoins":
                return <WalletsSection />;
            case "reports":
                return <UserReportsSection />;
            case "notifications":
                return <NotificationsSection />;
            case "payments":
                return <PaymentsSection />;
            case "coupons":
                return <AdminCouponsSection />;

            default:
                return <div className="text-muted">Select a section</div>;
        }
    };

    return (
        <div className="container-fluid">
            <div className="row min-vh-100">
                {/* Sidebar */}
                <nav className="col-12 col-md-3 col-lg-2 bg-dark text-white p-3">
                    <h4 className="text-center mb-4">Admin Panel</h4>
                    <ul className="nav flex-column">
                        <li className="nav-item mb-2">
                            <button className="btn btn-outline-light w-100" onClick={() => setActiveSection("products")}>🛍 Products</button>
                        </li>
                        <li className="nav-item mb-2">
                            <button className="btn btn-outline-light w-100" onClick={() => setActiveSection("categories")}>🛍 Categories</button>
                        </li>
                        <li className="nav-item mb-2">
                            <button className="btn btn-outline-light w-100" onClick={() => setActiveSection("orders")}>📦 Orders</button>
                        </li>
                        <li className="nav-item mb-2">
                            <button className="btn btn-outline-light w-100" onClick={() => setActiveSection("users")}>👥 Users</button>
                        </li>
                        <li className="nav-item mb-2">
                            <button className="btn btn-outline-light w-100" onClick={() => setActiveSection("walletsCoins")}>👥 wallet and coins</button>
                        </li>
                        <li className="nav-item mb-2">
                            <button className="btn btn-outline-light w-100" onClick={() => setActiveSection("coupons")}>
                                🎁 Coupons
                            </button>
                        </li>

                        <li className="nav-item mb-2">
                            <button className="btn btn-outline-light w-100" onClick={() => setActiveSection("notifications")}>👥 notifications</button>
                        </li>
                        <li className="nav-item mb-2">
                            <button className="btn btn-outline-light w-100" onClick={() => setActiveSection("payments")}>👥 payments</button>
                        </li>
                        <li className="nav-item mb-2">
                            <button className="btn btn-outline-light w-100" onClick={() => setActiveSection("reports")}>👥 reports</button>
                        </li>
                    </ul>
                </nav>

                {/* Main content */}
                <main className="col-12 col-md-9 col-lg-10 p-4">
                    {renderSection()}
                </main>
            </div>
        </div>
    );
}
