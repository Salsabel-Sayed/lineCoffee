// import React from "react";

type Order = {
    id: string;
    createdAt: string;
    totalAmount: number;
    finalAmount: number;
    code:string;
    
    status: string;
    coupon?: boolean;
    discount?: number;
    usedWallet?: boolean;
    walletAmount?: number;
    items: {
        product?: {
            productsName: string;
            price: number;
        } | string;
        quantity: number;
        
      }[];
    shippingAddress: string;
    extraAddress?: string;
};
  
interface OrdersListProps {
    orders: Order[];
}

function getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
        case "delivered":
            return "bg-success";
        case "on the way":
            return "bg-warning text-dark";
        case "pending":
            return "bg-secondary";
        default:
            return "bg-light text-dark";
    }
}

function OrdersList({ orders }: OrdersListProps) {
    return (
<section className="orderList">
            <div className="orders-list">
                <h3 className="mb-4">Your Orders</h3>

                {orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    <div className="row">
                        {orders.map((order) => {
                            const orderId = (order).id || order.id;
                            console.log("ORDER:", order); // 👈 هنا
                            return (
                                <div key={orderId} className="col-12 col-md-6 col-lg-4 mb-4">
                                    <div className=" h-100 glass-effect">
                                        <div className="card-body d-flex flex-column justify-content-between">
                                            <div>
                                                <h5 className="card-title">Order #{order.code}</h5>
                                                <p className=" mb-1">
                                                    📅 {new Date(order.createdAt).toLocaleDateString()}
                                                </p>

                                                <div className="mb-2">
                                                    <div className="desginOrderInfo  glass-btn">
                                                        <strong>Products:</strong>
                                                        <div className="grid grid-cols-2 gap-3 ps-3">
                                                            {order.items.map((item, i) => {
                                                                const productName =
                                                                    typeof item.product === "object" && "productsName" in item.product
                                                                        ? item.product.productsName
                                                                        : "Unnamed Product";

                                                                return (
                                                                    <div
                                                                        key={`${order.id}-${i}`}
                                                                        className="glass-btn p-2 rounded-md shadow-sm"
                                                                    >
                                                                        <div className="text-gray-700 font-medium">{productName}</div>
                                                                        <div className="text-sm text-gray-500  glass-btn">
                                                                            {item.quantity}
                                                                            {typeof item.product === "object" && "price" in item.product && (
                                                                                <> <span>× {item.product.price} EGP</span></>
                                                                            )}
                                                                        </div>

                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                    </div>

                                                    <div className="desginOrderInfo glass-btn">
                                                        <strong>Subtotal:</strong>
                                                        <p>{order.totalAmount} EGP</p> 
                                                    </div>
                                                    
                                                    <div className="desginOrderInfo glass-btn">
                                                        <strong>Final:</strong>
                                                        <p>{order.finalAmount} EGP</p>
                                                    </div>
                                                    
                                                   <div className="desginOrderInfo glass-btn">
                                                        <strong>Coupon:</strong>{" "}
                                                        <p>{order.coupon ? `${order.discount || 0} EGP` : "Not used"}</p>
                                                   </div>
                                                    
                                                    <div className="desginOrderInfo glass-btn">
                                                        <strong>Wallet:</strong>{" "}
                                                        <p>{order.walletAmount && order.walletAmount > 0
                                                            ? `${order.walletAmount} EGP`
                                                            : "Not used"}</p>
                                                    </div>
                                                    
                                                    <div className="desginOrderInfo glass-btn">
                                                        <strong>Shipping Address:</strong>
                                                        <p>{order.shippingAddress || "N/A"}</p>
                                                    </div>
                                                    
                                                   <div className="desginOrderInfo glass-btn">
                                                        {order.extraAddress && (
                                                            <>
                                                                <strong>Extra Address:</strong>
                                                                <p>{order.extraAddress}</p>
                                                                
                                                            </>
                                                        )}
                                                   </div>

                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <span
                                                    className={`badge ${getStatusClass(order.status)} w-100 statusBtn`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                    </div>
                )}
            </div>
</section>
    );
}

export default OrdersList;
