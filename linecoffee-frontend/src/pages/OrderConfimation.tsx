import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY, getUserIdFromToken, TOKEN_KEY } from "../utils/authUtils";
import axios from "axios";

export default function ConfirmOrderPage() {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const { cartItems, clearCart } = useCart();
    const [address, setAddress] = useState("");
    const [extraAddress, setExtraAddress] = useState("");

    const [confirmed, setConfirmed] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState("");

    const userId = getUserIdFromToken();


    const location = useLocation();
    const {
        couponDiscount = 0,
        walletAmount = 0,
        finalTotal = 0,
        couponCode = "",
    } = location.state || {};

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const getDecryptedToken = () => {
        const encrypted = localStorage.getItem(TOKEN_KEY);
        if (!encrypted) return null;
        try {
            const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (err) {
            console.error("Failed to decrypt token:", err);
            return null;
        }
    };

    // ✅ Fetch default user address on mount
    useEffect(() => {
        const fetchUserAddress = async () => {
            const token = getDecryptedToken();
            if (!token) return;

            try {
                const res = await axios.get(`${backendURL}/users/finduserInfo/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("res", res);

                const data = res.data;

                // ✅ هنا التصليح
                if (data.user?.address) {
                    setAddress(data.user.address);
                }

            } catch (err) {
                console.log("Failed to fetch user address:", err);
            }
        };

        fetchUserAddress();
    }, []);


    const handleConfirm = async () => {
        if (!address.trim() && !extraAddress.trim()) {
            alert("Please provide a shipping address.");
            return;
        }

        if (!selectedPayment) {
            alert("Please select a payment method.");
            return;
        }

        const token = getDecryptedToken();
        if (!token) {
            alert("User not authenticated");
            return;
        }

        try {
            // ✅ إنشاء الأوردر
            const createRes = await axios.post(
                `${backendURL}/orders/createOrder`,
                {
                    items: cartItems.map(item => ({
                        product: item.id,
                        quantity: item.quantity,
                    })),
                    couponCode,
                    walletAmount,
                    shippingAddress: address,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const created = createRes.data;
            if (!created.success) throw new Error("Order creation failed");

            const orderId = created.order._id;

            // ✅ تأكيد الأوردر
            const completeRes = await axios.put(
                `${backendURL}/orders/completeOrder/${orderId}`,
                {
                    paymentMethod: selectedPayment,
                    walletAmount,
                    shippingAddress: address,
                    extraAddress: extraAddress || "",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const completeData = completeRes.data;

            console.log("✅ Order completed", completeData);

            setConfirmed(true);
            clearCart();
        } catch (err) {
            console.error("❌ Error confirming order:", err);
            alert("Failed to confirm order.");
        }
    };



    if (confirmed) {
        return (
            <div className="container mt-5 text-center">
                <h2>🎉 Order Confirmed!</h2>
                <p>Your order has been successfully placed.</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">🧾 Confirm Your Order</h2>
            <div className="row">
                <div className="col-lg-8 mb-4">
                    <div className="card p-3 mb-4 shadow-sm">
                        <h5>📍 Shipping Address</h5>

                        <div className="mb-3">
                            <label className="form-label">Default Address</label>
                            <input
                                className="form-control"
                                value={address}
                                disabled
                            />
                        </div>

                        <div>
                            <label className="form-label">Add Another Address (Optional)</label>
                            <textarea
                                className="form-control"
                                rows={2}
                                value={extraAddress}
                                onChange={(e) => setExtraAddress(e.target.value)}
                                placeholder="Enter alternative shipping address (optional)"
                            />
                        </div>
                    </div>


                    <div className="list-group">
                        {cartItems.map((item) => (
                            <ProductCard
                                key={item.id}
                                image={item.image}
                                name={item.name}
                                price={item.price * item.quantity}
                                quantity={item.quantity}
                                onRemove={() => { }}
                                onQuantityChange={() => { }}
                            />
                        ))}
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card p-3 shadow-sm">
                        <h5>Order Summary</h5>
                        <ul className="list-group mb-3">
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Subtotal</span>
                                <strong>{subtotal} EGP</strong>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Coupon Discount</span>
                                <span>- {couponDiscount} EGP</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Wallet Used</span>
                                <span>- {walletAmount} EGP</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <strong>Total</strong>
                                <strong>{finalTotal} EGP</strong>
                            </li>
                        </ul>

                        <div className="mb-3">
                            <label className="form-label">Payment Method</label>
                            <select
                                className="form-select"
                                value={selectedPayment}
                                onChange={(e) => setSelectedPayment(e.target.value)}
                            >
                                <option value="">Select payment method</option>
                                <option value="cash">Cash on Delivery</option>
                                <option value="vodafone">Vodafone Cash</option>
                                <option value="insta">insta pay</option>
                            </select>
                        </div>

                        <button className="btn btn-success w-100" onClick={handleConfirm}>
                            Confirm Order
                        </button>
                        {(selectedPayment === "vodafone" || selectedPayment === "insta") && (
                            <div className="alert alert-info mt-3 text-center">
                                <strong>📱 Please transfer the total amount to:</strong><br />
                                Mobile Number: <strong>01012345678</strong><br />
                                After transferring, we will confirm your order via call or admin approval.
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
