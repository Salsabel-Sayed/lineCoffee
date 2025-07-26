import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getDecryptedToken } from "../../../utils/authUtils"; // ✅ تأكد من المسار حسب مشروعك



interface Coupon {
    _id: string;
    couponCode: string;
    discountPercentage: number;
    expiresAt: string;
    isGlobal: boolean;
    isActive: boolean;
    userId?: string;
}

export default function AdminCouponsSection() {
    const token = getDecryptedToken();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [form, setForm] = useState({
        couponCode: "",
        discountPercentage: 10,
        expiresAt: "",
        isGlobal: true,
        userId: "",
    });

    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const fetchCoupons = async () => {
        try {
            const res = await axios.get(`${backendURL}/coupons/getAllCoupons`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Fetched coupons:", res.data);

            if (Array.isArray(res.data.coupons)) {
                setCoupons(res.data.coupons);
            } else {
                console.warn("Expected coupons array but got:", res.data);
                setCoupons([]); // fallback
            }
        } catch (err) {
            console.error("Failed to fetch coupons", err);
            toast.error("Failed to fetch coupons");
            setCoupons([]); // fallback
        }
    };



    const handleCreateCoupon = async () => {
        try {
             // ✅ استخدم الدالة من authUtils
            if (!token) {
                toast.error("Missing token. Please login again.");
                return;
            }

            console.log("TOKEN SENT:", token);

            await axios.post(`${backendURL}/coupons/addCoupons`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("Coupon created");
            fetchCoupons();
        } catch (error) {
            console.log(error);
            toast.error("Failed to create coupon");
        }
    };

    const deleteCoupon = async (id: string) => {
        try {
            await axios.delete(`${backendURL}/coupons/deleteCoupon/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Coupon deleted");
            fetchCoupons();
        } catch {
            toast.error("Failed to delete");
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    return (
        <div>
            <h3>🎁 Manage Coupons</h3>

            {/* Coupon Form */}
            <div className="mb-4">
                <input
                    placeholder="Coupon Code"
                    className="form-control mb-2"
                    value={form.couponCode}
                    onChange={(e) => setForm({ ...form, couponCode: e.target.value })}
                />
                <input
                    placeholder="Discount %"
                    type="number"
                    className="form-control mb-2"
                    value={form.discountPercentage}
                    onChange={(e) =>
                        setForm({ ...form, discountPercentage: Number(e.target.value) })
                    }
                />
                <input
                    placeholder="Expires At"
                    type="date"
                    className="form-control mb-2"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
                <select
                    className="form-select mb-2"
                    value={form.isGlobal ? "global" : "user"}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            isGlobal: e.target.value === "global",
                            userId: "",
                        })
                    }
                >
                    <option value="global">🌐 Global Coupon</option>
                    <option value="user">👤 Specific User</option>
                </select>

                {!form.isGlobal && (
                    <input
                        placeholder="User ID"
                        className="form-control mb-2"
                        value={form.userId}
                        onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    />
                )}

                <button className="btn btn-primary" onClick={handleCreateCoupon}>
                    ➕ Create Coupon
                </button>
            </div>

            {/* Coupon List */}
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Discount</th>
                        <th>Expires</th>
                        <th>User</th>
                        <th>Global</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {coupons.map((c) => (
                        <tr key={c._id}>
                            <td>{c.couponCode}</td>
                            <td>{c.discountPercentage}%</td>
                            <td>{new Date(c.expiresAt).toLocaleDateString()}</td>
                            <td>{c.userId || "All"}</td>
                            <td>{c.isGlobal ? "✅" : "❌"}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => deleteCoupon(c._id)}
                                >
                                    🗑
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
