import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Product = {
    _id: string;
    productsName: string;
    imageUrl?: string;
    productsDescription: string;
    availableVariants?: {
        type: string;
        weights: { weight: number; price: number }[];
    }[];
    price?: number;
};

export default function AdminProductList() {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [products, setProducts] = useState<Product[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${backendURL}/products/getAllProducts`)
            .then((response) => setProducts(response.data.products))
            .catch((error) => console.error("Error fetching products:", error));
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${backendURL}/products/deleteProduct/${id}`);
            setProducts(products.filter((product) => product._id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-success" onClick={() => navigate("/admin/add-product")}>
                    ➕ Add Product
                </button>
            </div>

            <div className="row">
                {products.map((product) => (
                    <div key={product._id} className="col-md-6 col-lg-4 mb-4">
                        <div className="card h-100">
                            <img
                                src={`${backendURL}/${product.imageUrl?.replace(/^\/+/, "")}`}
                                alt={product.productsName}
                                className="card-img-top"
                                crossOrigin="anonymous"
                            />
                            <div className="card-body">
                                <h5 className="card-title">{product.productsName}</h5>
                                <p className="card-text text-truncate">{product.productsDescription}</p>
                                {product.availableVariants && product.availableVariants.length > 0 ? (
                                    <ul className="mb-2 ps-3">
                                        {product.availableVariants.map((variant, i) => (
                                            <li key={i}>
                                                <strong>{variant.type}:</strong>
                                                <ul>
                                                    {variant.weights.map((w, idx) => (
                                                        <li key={idx}>
                                                            {w.weight} جم - {w.price} جنيه
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                ) : product.price ? (
                                    <p className="mb-2"><strong>السعر:</strong> {product.price} جنيه</p>
                                ) : (
                                    <p className="mb-2 text-muted">لا يوجد سعر</p>
                                )}



                                <button
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(product._id)}
                                >
                                    🗑 Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
