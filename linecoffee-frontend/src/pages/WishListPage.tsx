// pages/WishListPage.tsx
import { useWishList } from "../context/WishListContext";

export default function WishListPage() {
    const { wishList, toggleWish } = useWishList();

    return (
        <div className="container mt-5">
            <h2>⭐ Your Wish List</h2>
            {wishList.length === 0 ? (
                <p>No items in wishlist.</p>
            ) : (
                <div className="row">
                    {wishList.map(product => (
                        <div key={product.id} className="col-md-4 mb-4">
                            <div className="card glass-btn">
                                <img
                                    src={
                                        product.image?.startsWith("http")
                                            ? product.image
                                            : `${import.meta.env.VITE_BACKEND_URL}/${product.image?.replace(/^\/+/, "")}`
                                    }
                                    alt={product.name}
                                    className="card-img-top"
                                    crossOrigin="anonymous"
                                />

                                <div className="card-body">
                                    <h5>{product.name}</h5>
                                    <p>{product.price} EGP</p>
                                    <button onClick={() => toggleWish(product)} className="btn btn-warning">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
