import { useEffect, useState } from "react";
import axios from "axios";

type ProductFormProps = {
    onBack: () => void;
};

type WeightOption = {
    weight: number;
    price: number;
};

type Variant = {
    type: string;
    weights: WeightOption[];
};

export default function ProductForm({ onBack }: ProductFormProps) {
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [categories, setCategories] = useState<{ _id: string; categoryName: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [available, setAvailable] = useState(true);
    const [inStock, setInStock] = useState(0);

    const [variantType, setVariantType] = useState("");
    const [variantWeights, setVariantWeights] = useState<WeightOption[]>([]);
    const [availableVariants, setAvailableVariants] = useState<Variant[]>([]);

    const [newWeight, setNewWeight] = useState(0);
    const [newPrice, setNewPrice] = useState(0);
    const [price, setPrice] = useState(0); // السعر العام


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

    const handleAddWeight = () => {
        if (newWeight > 0 && newPrice > 0) {
            setVariantWeights([...variantWeights, { weight: newWeight, price: newPrice }]);
            setNewWeight(0);
            setNewPrice(0);
        }
    };

    const handleAddVariant = () => {
        if (variantType.trim() !== "" && variantWeights.length > 0) {
            setAvailableVariants([...availableVariants, { type: variantType, weights: variantWeights }]);
            setVariantType("");
            setVariantWeights([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("productsName", name);
        formData.append("productsDescription", description);
        formData.append("category", selectedCategory);
        formData.append("available", available.toString());
        formData.append("inStock", inStock.toString());
        formData.append("price",price.toString());

        formData.append("availableVariants", JSON.stringify(availableVariants));
        if (image) formData.append("image", image);

        try {
            const res = await axios.post(`${backendURL}/products/addProduct`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log(res.data);
            alert("Product added successfully!");
            onBack();
        } catch (err) {
            console.error(err);
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
                <label className="form-label">Upload Image</label>
                <input type="file" className="form-control" onChange={e => setImage(e.target.files?.[0] || null)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Category</label>
                <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
                    <option value="">-- Select a category --</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Product Price (if no variants)</label>
                <input
                    type="number"
                    className="form-control"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                />
            </div>



            <div className="mb-3">
                <label className="form-label">Variant Type (e.g., سادة، محوج)</label>
                <input type="text" className="form-control" value={variantType} onChange={e => setVariantType(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Add Weight and Price to Variant</label>
                <div className="d-flex gap-2">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Weight (g)"
                        value={newWeight}
                        onChange={(e) => setNewWeight(Number(e.target.value))}
                    />
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Price"
                        value={newPrice}
                        onChange={(e) => setNewPrice(Number(e.target.value))}
                    />
                    <button type="button" className="btn btn-outline-primary" onClick={handleAddWeight}>
                        ➕ Add Weight
                    </button>
                </div>
                {variantWeights.length > 0 && (
                    <ul className="list-group mt-2">
                        {variantWeights.map((w, idx) => (
                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                {w.weight}g - {w.price} EGP
                                <button type="button" className="btn btn-sm btn-danger" onClick={() => {
                                    setVariantWeights(variantWeights.filter((_, i) => i !== idx));
                                }}>🗑</button>
                            </li>
                        ))}
                    </ul>
                )}
                <button type="button" className="btn btn-secondary mt-2" onClick={handleAddVariant}>
                    ✅ Save Variant
                </button>
            </div>

            {availableVariants.length > 0 && (
                <div className="mb-3">
                    <label className="form-label">All Variants</label>
                    <ul className="list-group">
                        {availableVariants.map((variant, idx) => (
                            <li key={idx} className="list-group-item">
                                <strong>{variant.type}</strong>
                                <ul className="mt-2">
                                    {variant.weights.map((w, i) => (
                                        <li key={i}>{w.weight}g - {w.price} EGP</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

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
