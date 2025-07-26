import { useEffect, useState } from "react";
import axios from "axios";
import { getDecryptedToken } from "../utils/authUtils";

interface Coupon {
    _id: string;
    couponCode: string;
    discountPercentage: number;
    expiresAt: string;
    isActive: boolean;
    isGlobal: boolean;
    userId?: string | null;
}

interface RawCoupon {
    _id: string;
    used: boolean;
    usedAt?: string;
    couponId: Coupon;
}

interface UserCoupon {
    _id: string;
    used: boolean;
    usedAt?: string;
    coupon: Coupon;
}



function CouponsList() {
    const [coupons, setCoupons] = useState<UserCoupon[]>([]);
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchCoupons = async () => {
            const token = getDecryptedToken();
            const userId = localStorage.getItem("userId");

            try {
                const res = await axios.get(`${backendURL}/users/finduserInfo/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("coupons response:", res.data.user.coupons);

                // 🛠️ Map raw data to expected UserCoupon format
                const mapped = (res.data.user.coupons as RawCoupon[])
                    .map((item) => {
                        if (!item.couponId) {
                            console.log("⚠️ Missing couponId in item:", item);
                            return null;
                        }
                        console.log("couponId from BE:", item.couponId);


                        return {
                            _id: item._id,
                            used: item.used,
                            usedAt: item.usedAt,
                            coupon: {
                                _id: item.couponId._id,
                                couponCode: item.couponId.couponCode,
                                discountPercentage: item.couponId.discountPercentage,
                                expiresAt: item.couponId.expiresAt,
                                isActive: item.couponId.isActive,
                                isGlobal: item.couponId.isGlobal,
                                userId: item.couponId.userId || null,
                            },
                        };
                    })
                    .filter(Boolean);

                setCoupons(mapped as UserCoupon[]);

            } catch (err) {
                console.error("Failed to fetch coupons", err);
            }
        };

        fetchCoupons();
    }, []);

    const usedCoupons = coupons.filter((c) => c.used);
    const unusedCoupons = coupons.filter((c) => !c.used);

    const renderTable = (data: UserCoupon[], title: string, isUsed: boolean) => (
        <>
            <h5 className="mt-4">{title}</h5>
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>Coupon Code</th>
                            <th>Discount %</th>
                            <th>{isUsed ? "Used At" : "Expires At"}</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(({ coupon, usedAt }, i) => (
                            <tr key={i}>
                                <td>{coupon.couponCode}</td>
                                <td>{coupon.discountPercentage}%</td>
                                <td>
                                    {isUsed
                                        ? usedAt
                                            ? new Date(usedAt).toLocaleDateString()
                                            : "Unknown"
                                        : new Date(coupon.expiresAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <span className={`badge ${isUsed ? 'bg-secondary' : 'bg-success'}`}>
                                        {isUsed ? "Used" : "Available"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    return (
        <div>
            <h4>🎁 My Coupons</h4>

            {coupons.length === 0 ? (
                <p>No coupons found.</p>
            ) : (
                <>
                    {renderTable(unusedCoupons, "🟢 Unused Coupons", false)}
                    {renderTable(usedCoupons, "🔘 Used Coupons", true)}
                </>
            )}
        </div>
    );
}

export default CouponsList;
