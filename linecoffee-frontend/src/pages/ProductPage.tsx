// ProductsPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import ProductsList from "./ProductsList";
import { useSearchParams } from "react-router-dom";


type Product = {
    id: string;
    name: string;
    description?: string;
    image: string;
    price: number;
    category?: string;
    quantity: number;
    averageRating?: number;
};
type RawProduct = {
    _id: string;
    productsName: string;
    productsDescription?: string;
    imageUrl?: string;
    price: number;
    category?: string;
    averageRating?: number;
};
  
  

type Category = {
    _id: string;
    categoryName: string;
};

function ProductsPage() {
    const [searchParams] = useSearchParams();
    const categoryFromURL = searchParams.get("category");

    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAndSearchedProducts = filteredProducts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    axios.get(`${backendURL}/products/getAllProducts`),
                    axios.get(`${backendURL}/categories/getAllCategories`)
                ]);

                const mappedProducts = (productsRes.data.products as RawProduct[]).map((p) => ({
                    id: p._id,
                    name: p.productsName,
                    description: p.productsDescription,
                    image: `${backendURL}/${p.imageUrl?.replace(/^\/+/, "")}`,
                    price: p.price,
                    category: p.category,
                    quantity: 1,
                    averageRating: p.averageRating,
                }));

                setProducts(mappedProducts);
                setCategories(categoriesRes.data.categories);

                if (categoryFromURL) {
                    setSelectedCategory(categoryFromURL);
                    setFilteredProducts(mappedProducts.filter(p => p.category === categoryFromURL));
                } else {
                    setFilteredProducts(mappedProducts);
                }

            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleFilter = (categoryId: string) => {
        setSelectedCategory(categoryId);
        if (categoryId === "all") {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.category === categoryId));
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar / Categories */}
                <div className="col-12 col-md-3 mb-3 mb-md-0">
                    <div className="bg-light p-3 rounded shadow-sm">
                        <h5 className="mb-3">Categories</h5>
                        <ul className="list-group">
                            <li
                                className={`list-group-item ${selectedCategory === "all" ? "active" : ""}`}
                                onClick={() => handleFilter("all")}
                                role="button"
                            >
                                All
                            </li>
                            {categories.map((cat) => (
                                <li
                                    key={cat._id}
                                    className={`list-group-item ${selectedCategory === cat._id ? "active" : ""}`}
                                    onClick={() => handleFilter(cat._id)}
                                    role="button"
                                >
                                    {cat.categoryName}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Products Area */}
                <div className="col-12 col-md-9">
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="🔍 Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

<ProductsList
                        products={filteredAndSearchedProducts}
                    />



                </div>
            </div>
        </div>
    );
}

export default ProductsPage;
