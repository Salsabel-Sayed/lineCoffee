import { useEffect, useState } from "react";
import axios from "axios";

type ProductFormProps = {
    onBack: () => void;
};

export default function ProductForm({ onBack }: ProductFormProps) {
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [categories, setCategories] = useState<{ _id: string; categoryName: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState(""); // ✅ الجديد
    const [available, setAvailable] = useState(true);
    const [inStock, setInStock] = useState(0);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${backendURL}/categories/getAllCategories`);
                setCategories(res.data.categories);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("productsName", name);
        formData.append("price", price.toString());
        formData.append("productsDescription", description);
        formData.append("category", selectedCategory); // ✅ استخدمي ID بتاع الكاتيجوري هنا
        if (image) formData.append("image", image);
        formData.append("available", available.toString());
        formData.append("inStock", inStock.toString());

        try {
            const res = await axios.post(`${backendURL}/products/addProduct`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            console.log(res.data);
            alert("Product Added Successfully!");
            onBack();
        } catch (err) {
            console.log(err);
            alert("Failed to add product!");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Product Name</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Price</label>
                <input type="number" className="form-control" value={price} onChange={e => setPrice(+e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Upload Image</label>
                <input type="file" className="form-control" onChange={e => setImage(e.target.files?.[0] || null)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)}></textarea>
            </div>

            <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                >
                    <option value="">-- Select a category --</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Available</label>
                <select className="form-select" value={available.toString()} onChange={e => setAvailable(e.target.value === "true")}>
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">In Stock</label>
                <input type="number" className="form-control" value={inStock} onChange={e => setInStock(+e.target.value)} />
            </div>

            <button type="submit" className="btn btn-success me-2">✅ Save</button>
            <button type="button" className="btn btn-secondary" onClick={onBack}>↩ Cancel</button>
        </form>
    );
}
