import { useState, useEffect } from "react";
import axios from "axios";

type Props = {
    onClose: () => void;
    existingCategory: {
        _id: string;
        categoryName: string;
        categoryDescription?: string;
        image?: string;
        createdAt: string;
    } | null;
};

export default function CategoryForm({ onClose, existingCategory }: Props) {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);

    useEffect(() => {
        if (existingCategory) {
            setCategoryName(existingCategory.categoryName);
            setCategoryDescription(existingCategory.categoryDescription || "");
        }
    }, [existingCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("categoryName", categoryName);
        formData.append("categoryDescription", categoryDescription);
        if (image) {
            formData.append("categoryImage", image); // fieldname حسب multer في الباك
        }

        try {
            if (existingCategory) {
                await axios.put(`${backendURL}/categories/updateCategory/${existingCategory._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                await axios.post(`${backendURL}/categories/addCategory`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            onClose();
        } catch (err) {
            console.error("Error saving category:", err);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                        {existingCategory ? "✏️ Edit Category" : "➕ Add New Category"}
                    </h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Category Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Category Description</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={categoryDescription}
                                onChange={(e) => setCategoryDescription(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Upload Image</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files?.[0] || null)}
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-success">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
