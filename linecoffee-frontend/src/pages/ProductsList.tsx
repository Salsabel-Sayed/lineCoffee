import { Link, useNavigate } from "react-router-dom";
import { useWishList } from "../context/WishListContext";

import { toast } from "react-toastify";
import { getDecryptedToken } from "../utils/authUtils";
import { renderStars } from "../utils/RatingUtils";
import { t } from "i18next";


// Define Product type
type Product = {
    id: string;
    name: string;
    description?: string;
    image: string;
    category?: string;
    quantity: number;
    averageRating?: number;
    price?: number;
    availableVariants?: {
        type: string;
        weights: { weight: number; price: number }[];
    }[];
};
  


// Props for the list
type ProductsListProps = {
    products: Product[];
};

function ProductsList({ products }: ProductsListProps) {
    const { toggleWish, wishList } = useWishList();
    const navigate = useNavigate();


    const handleToggleWish = (product: Product) => {
        const token = getDecryptedToken();
        if (!token) {
            toast.warning("برجاء تسجيل الدخول أولاً");
            return navigate("/login");
        }

        toggleWish(product);
    };
    

    return (
        <section id="productsList">
            <div className="container-fluid">
                <div className="row">
                    {products.map((product) => {
                        console.log("PRODUCT:", product);
                        

                        const inWishList = wishList.some((p) => p.id === product.id);




                        return (
                            <div key={product.id} className={`mb-4 ${products.length === 1
                                    ? "col-12"
                                    : "col-12 col-sm-6 col-lg-4"
                                }`}>
                                <div className="cardPro glass-effect shadow-sm p-2" style={{ borderRadius: "10px" }}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className=""
                                        style={{ height: "250px", objectFit: "cover" }}
                                        crossOrigin="anonymous"
                                    />
                                    <div className="card-body">
                                        <div className="m-3">
                                            <h5 className="card-title fw-bold">
                                                {t(`product.${product.name}`, { defaultValue: product.name })}
                                            </h5>
                                        </div>
                                        
                                        <h4 className="fw-bold text-success mb-3">
                                            {(() => {
                                                const allPrices: number[] = [];

                                                if (product.availableVariants && product.availableVariants.length > 0) {
                                                    product.availableVariants.forEach(variant => {
                                                        variant.weights.forEach(w => {
                                                            if (!isNaN(w.price)) allPrices.push(w.price);
                                                        });
                                                    });
                                                }

                                                if (allPrices.length > 0) {
                                                    const minPrice = Math.min(...allPrices);
                                                    return `ابتداءً من ${minPrice} جنيه`;
                                                }

                                                return product.price ? `${product.price} جنيه` : "غير متوفر";
                                            })()}
                                        </h4>


                                        {/* Render star rating */}
                                        <div className="mb-2 d-flex align-items-center  mb-4">
                                            {renderStars(product.averageRating ?? 0)}
                                            <span className="ms-2 small">
                                                ({(product.averageRating ?? 0).toFixed(1)})
                                            </span>
                                        </div>


                                        {/* Wishlist button */}
                                        <button
                                            className={`btn btn-sm ${inWishList ? "glass-btn" : "glass-btn"} me-2`}
                                            onClick={() => handleToggleWish(product)}
                                        >
                                            {inWishList ? "★ Remove" : "☆ WishList"}
                                        </button>

                                        {/* Cart button */}

                                        {/* View product */}
                                        <Link to={`/product/${product.id}`} className="btn btn-sm  glass-btn">
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default ProductsList;
