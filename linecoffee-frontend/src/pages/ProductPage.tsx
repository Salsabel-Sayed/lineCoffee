// ProductsPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import ProductsList from "./ProductsList";
import { useSearchParams } from "react-router-dom";
import { Button, Offcanvas } from "react-bootstrap"; // ⬅️ مهم
import { t } from "i18next";

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
    const [showSidebar, setShowSidebar] = useState(false); // ⬅️ للتحكم في الـ Offcanvas

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
                    averageRating: p.averageRating
                }));

                setProducts(mappedProducts);
                setCategories(categoriesRes.data.categories);

                if (categoryFromURL) {
                    setSelectedCategory(categoryFromURL);
                    setFilteredProducts(mappedProducts.filter((p) => p.category === categoryFromURL));
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
        setShowSidebar(false); // ⬅️ يقفل الـ Offcanvas بعد الاختيار
        if (categoryId === "all") {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter((p) => p.category === categoryId));
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <section id="productPage glass-section">
            <div className="container-fluid productPage ">
                <div className="row">
                    {/* 🔹 Sidebar for desktop */}
                    <div className="col-md-3 d-none d-md-block ">
                        <div className=" p-3 rounded shadow-sm glass-effect">
                            <h5 className="mb-3">Categories</h5>
                            <ul className="list-group ">
                                <li
                                    className={`list-group-item p-3 ${selectedCategory === "all" ? "active" : ""}`}
                                    onClick={() => handleFilter("all")}
                                    role="button"
                                >
                                    All
                                </li>
                                {categories.map((cat) => (
                                    <li
                                        key={cat._id}
                                        className={`list-group-item p-3  ${selectedCategory === cat._id ? "active" : ""}`}
                                        onClick={() => handleFilter(cat._id)}
                                        role="button"
                                    >
                                        {t(`categories.${cat.categoryName.toLowerCase()}`) || cat.categoryName}

                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 🔹 Sidebar Toggle button for small screens */}
                    <div className="col-12 d-md-none mb-3">
                        <Button className="filterBtn"  onClick={() => setShowSidebar(true)}>
                            ☰ Filter by Category
                        </Button>
                    </div>

                    {/* 🔹 Offcanvas for small screens */}
                    <Offcanvas className="glass-effect" show={showSidebar} onHide={() => setShowSidebar(false)} placement="start">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Categories</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body >
                            <div className="catListGrop  ">
                                <ul className="list-group">
                                    <li
                                        className={`list-group-item p-3 ${selectedCategory === "all" ? "active" : ""}`}
                                        onClick={() => handleFilter("all")}
                                        role="button"
                                    >
                                        All
                                    </li>
                                    {categories.map((cat) => (
                                        <li
                                            key={cat._id}
                                            className={`list-group-item p-3 ${selectedCategory === cat._id ? "active" : ""}`}
                                            onClick={() => handleFilter(cat._id)}
                                            role="button"
                                        >
                                            {t(`categories.${cat.categoryName.toLowerCase()}`) || cat.categoryName}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Offcanvas.Body>
                    </Offcanvas>

                    {/* 🔹 Products */}
                    <div className="col-md-9">
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="🔍 Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <ProductsList products={filteredAndSearchedProducts} />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductsPage;
