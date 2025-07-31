// BoxesOffers.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Product = {
    _id: string;
    productsName: string;
    imageUrl: string;
    category: string;
    categoryName: string;
};

const BoxesOffers = () => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [products, setProducts] = useState<Product[]>([]);
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${backendURL}/products/getAllProducts`);
                const allProducts: Product[] = res.data.products;

                const filtered = allProducts.filter(
                    (product) =>
                        product.categoryName.toLowerCase() === "boxes" ||
                        product.categoryName.toLowerCase() === "offers" ||
                        product.categoryName === "بوكسات" ||
                        product.categoryName === "عروض"
                );

                setProducts(filtered);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <section id="offersSection">
            <div className="container">
                <div className="addrs">
                    <h1>{t("home.seeMore")}</h1>
                </div>

                <div className="row">
                    {products.map((product) => (
                        <div key={product._id} className="col-md-4 mb-4 ">
                            <div className="oneSide">
                                <img
                                    crossOrigin="anonymous"
                                    src={`${backendURL}/${product.imageUrl?.replace(/^\/+/, "")}`}
                                    alt={product.productsName}
                                />
                                <div className="bodyCard glass-btn">
                                    <h4>{product.productsName}</h4>
                                    <p>
                                        <small>
                                            {t("home.seeMore")} in {product.categoryName}
                                        </small>
                                    </p>
                                    <button
                                        onClick={() => navigate(`/product/${product._id}`)}
                                        className="btn glass-btn"
                                    >
                                        {t("home.seeMore")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BoxesOffers;
