import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import axios from "axios";
import { ENCRYPTION_KEY, TOKEN_KEY, getUserIdFromToken } from "../utils/authUtils";


interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    type?: string;
    weight?: number;
}

interface OrderItem {
    product: string;
    quantity: number;
    type?: string;
    weight?: number;
}


export default function CheckoutPage() {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart
    } = useCart() as {
        cartItems: CartItem[];
        removeFromCart: (args: { id: string; type?: string; weight?: number }) => void;
        updateQuantity: (args: { id: string; newQty: number; type?: string; weight?: number }) => void;
        clearCart: () => void;
    };



    const [coupon, setCoupon] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [walletAmount, setWalletAmount] = useState(0);
    const [walletError, setWalletError] = useState("");
    const [walletValid, setWalletValid] = useState(false);

    const [address, setAddress] = useState("");
    const [extraAddress, setExtraAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    const [finalTotal, setFinalTotal] = useState(0);
    const [confirmed, setConfirmed] = useState(false);

    const userId = getUserIdFromToken();

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    useEffect(() => {
        const afterWallet = Math.max(subtotal - (walletValid ? walletAmount : 0), 0);
        const afterCoupon = Math.max(afterWallet - couponDiscount, 0);
        setFinalTotal(afterCoupon);
    }, [subtotal, walletAmount, walletValid, couponDiscount]);

    const getDecryptedToken = () => {
        const encrypted = localStorage.getItem(TOKEN_KEY);
        if (!encrypted) return null;
        try {
            const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (err) {
            console.log("Failed to decrypt token:", err);
            return null;
        }
    };

    useEffect(() => {
        const fetchUserAddress = async () => {
            const token = getDecryptedToken();
            if (!token) return;

            try {
                const res = await axios.get(`${backendURL}/users/finduserInfo/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.user?.address) setAddress(res.data.user.address);
            } catch (err) {
                console.log("Failed to fetch user address:", err);
            }
        };
        fetchUserAddress();
    }, []);

    const handleConfirmOrder = async () => {
        if (!address.trim() && !extraAddress.trim()) {
            alert("Please provide a shipping address.");
            return;
        }

        if (!paymentMethod) {
            alert("Please select a payment method.");
            return;
        }

        const token = getDecryptedToken();
        if (!token) {
            alert("User not authenticated");
            return;
        }

        try {
            console.log("cartItems",cartItems)
            const res = await axios.post(
                `${backendURL}/orders/placeOrder`,
                {
                    items: cartItems.map((item): OrderItem => {
                        const dataToSend: OrderItem = {
                            product: item.id,
                            quantity: item.quantity,
                        };

                        if (item.type) dataToSend.type = item.type;
                        if (item.weight !== undefined) dataToSend.weight = item.weight;

                        return dataToSend;
                    }),


                    couponCode: coupon,
                    walletAmount: walletValid ? walletAmount : 0,
                    shippingAddress: address,
                    extraAddress,
                    paymentMethod,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log("✅ Order Placed", res.data);
            setConfirmed(true);
            clearCart();
        } catch (err) {
            console.log("❌ Order failed:", err);
            alert("Failed to place order.");
        }
    };

    if (confirmed) {
        return (
            <div className="container mt-5 text-center">
                <h2>🎉 Order Confirmed!</h2>
                <p>Your order has been placed successfully.</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">🧾 Checkout</h2>

            <div className="row">
                {/* المنتجات */}
                <div className="col-lg-8 mb-4">
                    <div className="list-group mb-4">
                        {cartItems.map((item) => (
                            <ProductCard
                                key={item.id}
                                image={item.image}
                                name={item.name}
                                price={item.price * item.quantity}
                                quantity={item.quantity}
                                onRemove={() =>
                                    removeFromCart({ id: item.id, type: item.type, weight: item.weight })
                                }
                                onQuantityChange={(qty) =>
                                    updateQuantity({ id: item.id, newQty: qty, type: item.type, weight: item.weight })
                                }

                            />
                        ))}
                    </div>

                    <div className="card p-3 shadow-sm mb-4 glass-btn">
                        <h5>📍 Shipping Address</h5>
                        <input className="form-control mb-2 " value={address} disabled />
                        <textarea
                            className="form-control"
                            placeholder="Add Extra Address (optional)"
                            value={extraAddress}
                            onChange={(e) => setExtraAddress(e.target.value)}
                        />
                    </div>
                </div>

                {/* ملخص الطلب */}
                <div className="col-lg-4">
                    <div className="card p-3 shadow-sm glass-btn">
                        <h5>Order Summary</h5>

                        {/* الكوبون */}
                        <div className="mb-3">
                            <label className="form-label">Coupon Code</label>
                            <input
                                type="text"
                                placeholder="enter your coupon..."
                                className="form-control glass-btn"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                            />
                            <button
                                className="btn btn-outline-secondary mt-1 w-100"
                                onClick={async () => {
                                    const token = getDecryptedToken();
                                    try {
                                        const res = await axios.post(
                                            `${backendURL}/coupons/validateCoupon`,
                                            {
                                                couponCode: coupon,
                                                totalAmount: subtotal,
                                            },
                                            {
                                                headers: { Authorization: `Bearer ${token}` },
                                            }
                                        );
                                        if (res.data.valid) {
                                            setCouponDiscount(res.data.discountValue);
                                        } else {
                                            alert(res.data.message || "Invalid coupon");
                                        }
                                    } catch (err) {
                                        console.log("Coupon error:", err);
                                    }
                                }}
                            >
                                Apply
                            </button>
                        </div>

                        {/* المحفظة */}
                        <div className="mb-3">
                            <label className="form-label">Wallet Amount</label>
                            <input
                                type="number"
                                className="form-control glass-btn"
                                value={walletAmount}
                                onChange={(e) => setWalletAmount(Number(e.target.value))}
                            />
                            <button
                                className="btn btn-outline-success mt-1 w-100"
                                onClick={async () => {
                                    const token = getDecryptedToken();
                                    try {
                                        const res = await axios.post(
                                            `${backendURL}/wallets/validateWalletAmount`,
                                            {
                                                walletAmount,
                                                totalAmount: subtotal,
                                            },
                                            {
                                                headers: { Authorization: `Bearer ${token}` },
                                            }
                                        );
                                        if (res.data.valid) {
                                            setWalletValid(true);
                                            setWalletError("");
                                        } else {
                                            setWalletValid(false);
                                            setWalletError(res.data.message);
                                        }
                                    } catch (err) {
                                        console.log("Wallet error:", err);
                                    }
                                }}
                            >
                                Validate
                            </button>
                            {walletError && <p className="text-danger">{walletError}</p>}
                        </div>

                        {/* الدفع */}
                        <div className="mb-3">
                            <label className="form-label">Payment Method</label>
                            <select
                                className="form-select"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="cash">Cash</option>
                                <option value="vodafone">Vodafone Cash</option>
                                <option value="insta">InstaPay</option>
                            </select>
                        </div>

                        {/* الحساب */}
                        <ul className="list-group mb-3">
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Subtotal</span>
                                <strong>{subtotal} EGP</strong>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Coupon</span>
                                <span>- {couponDiscount} EGP</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Wallet</span>
                                <span>- {walletValid ? walletAmount : 0} EGP</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <strong>Total</strong>
                                <strong>{finalTotal} EGP</strong>
                            </li>
                        </ul>

                        <button className="btn btn-primary w-100" onClick={handleConfirmOrder}>
                            Confirm Order
                        </button>

                        {(paymentMethod === "vodafone" || paymentMethod === "insta") && (
                            <div className="alert alert-info mt-3 text-center">
                                <strong>📱 Transfer the amount to:</strong><br />
                                01012345678<br />
                                Then confirm with admin
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
