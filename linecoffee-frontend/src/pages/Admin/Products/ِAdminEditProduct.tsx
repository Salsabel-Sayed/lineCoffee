import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

type Category = {
    _id: string;
    categoryName: string;
};

type ProductFormData = {
    productsName: string;
    productsDescription: string;
    category: string;
    imageUrl: string;
    availableVariants?: {
        type: string;
        weights: {
            weight: number;
            price: number;
        }[];
    }[];
    price: number;
};

export default function AdminEditProduct() {
    const { productId } = useParams();
    const isEditMode = !!productId;
    const navigate = useNavigate();
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const [formData, setFormData] = useState<ProductFormData>({
        productsName: "",
        productsDescription: "",
        category: "",
        imageUrl: "",
        availableVariants: [],
        price: 0,
    });

    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (isEditMode) {
            axios
                .get(`${backendURL}/products/getProductById/${productId}`)
                .then((res) => {
                    const product = res.data.product;
                    setFormData({
                        productsName: product.productsName,
                        productsDescription: product.productsDescription,
                        category: product.category,
                        imageUrl: product.imageUrl,
                        price: product.price,
                        availableVariants: product.availableVariants || [],
                    });
                })
                .catch((err) => console.log("Error loading product:", err));
        }
    }, [productId, backendURL, isEditMode]);

    useEffect(() => {
        axios
            .get(`${backendURL}/categories/getAllCategories`)
            .then((res) => setCategories(res.data.categories))
            .catch((err) => console.error("Error loading categories:", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = new FormData();
        form.append("productsName", formData.productsName);
        form.append("productsDescription", formData.productsDescription);
        form.append("category", formData.category);
        if (formData.price > 0) {
            form.append("price", String(formData.price));
        }

        if (formData.availableVariants) {
            form.append("availableVariants", JSON.stringify(formData.availableVariants));
        }

        if (selectedImageFile) {
            form.append("image", selectedImageFile);
        }

        try {
            if (isEditMode) {
                await axios.put(`${backendURL}/products/updateProduct/${productId}`, form);
                toast.success("تم تعديل المنتج بنجاح");
            } else {
                await axios.post(`${backendURL}/products/addProduct`, form);
                toast.success("تم إضافة المنتج بنجاح");
            }
            navigate("/admin");
        } catch (err) {
            console.error(err);
            toast.error("حدث خطأ أثناء حفظ المنتج");
        }
    };

    return (
        <div className="container">
            <h3 className="my-4">{isEditMode ? "تعديل منتج" : "إضافة منتج"}</h3>
            <form onSubmit={handleSubmit}>
                {/* الاسم */}
                <div className="mb-3">
                    <label className="form-label">اسم المنتج</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.productsName}
                        onChange={(e) => setFormData({ ...formData, productsName: e.target.value })}
                        required
                    />
                </div>

                {/* الوصف */}
                <div className="mb-3">
                    <label className="form-label">وصف المنتج</label>
                    <textarea
                        className="form-control"
                        value={formData.productsDescription}
                        onChange={(e) => setFormData({ ...formData, productsDescription: e.target.value })}
                        required
                    />
                </div>

                {/* السعر الأساسي */}
                <div className="mb-3">
                    <label className="form-label">السعر الأساسي</label>
                    <input
                        type="number"
                        className="form-control"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: +e.target.value })}
                    />
                </div>

                {/* الأوزان والأنواع */}
                <div className="mb-3">
                    <label className="form-label">الأنواع والأوزان</label>
                    {formData.availableVariants && formData.availableVariants.length > 0 && (
                        <>
                            {formData.availableVariants.map((variant, variantIdx) => (
                                <div key={variantIdx} className="mb-3 border rounded p-2">
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="نوع (مثلاً: سادة، محوج)"
                                        value={variant.type}
                                        onChange={(e) => {
                                            const updated = [...formData.availableVariants!];
                                            updated[variantIdx].type = e.target.value;
                                            setFormData({ ...formData, availableVariants: updated });
                                        }}
                                    />
                                    {variant.weights.map((w, wIdx) => (
                                        <div key={wIdx} className="d-flex gap-2 mb-2">
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="الوزن (جم)"
                                                value={w.weight}
                                                onChange={(e) => {
                                                    const updated = [...formData.availableVariants!];
                                                    updated[variantIdx].weights[wIdx].weight = +e.target.value;
                                                    setFormData({ ...formData, availableVariants: updated });
                                                }}
                                            />
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="السعر"
                                                value={w.price}
                                                onChange={(e) => {
                                                    const updated = [...formData.availableVariants!];
                                                    updated[variantIdx].weights[wIdx].price = +e.target.value;
                                                    setFormData({ ...formData, availableVariants: updated });
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => {
                                                    const updated = [...formData.availableVariants!];
                                                    updated[variantIdx].weights.splice(wIdx, 1);
                                                    setFormData({ ...formData, availableVariants: updated });
                                                }}
                                            >
                                                حذف وزن
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => {
                                            const updated = [...formData.availableVariants!];
                                            updated[variantIdx].weights.push({ weight: 0, price: 0 });
                                            setFormData({ ...formData, availableVariants: updated });
                                        }}
                                    >
                                        ➕ إضافة وزن
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger ms-2"
                                        onClick={() => {
                                            const updated = formData.availableVariants!.filter((_, i) => i !== variantIdx);
                                            setFormData({ ...formData, availableVariants: updated });
                                        }}
                                    >
                                        🗑 حذف النوع
                                    </button>
                                </div>
                            ))}
                        </>
                    )}
                    <button
                        type="button"
                        className="btn btn-outline-success mt-2"
                        onClick={() => {
                            const updated = [...(formData.availableVariants || [])];
                            updated.push({ type: "", weights: [{ weight: 0, price: 0 }] });
                            setFormData({ ...formData, availableVariants: updated });
                        }}
                    >
                        ➕ إضافة نوع جديد
                    </button>
                </div>

                {/* الفئة */}
                <div className="mb-3">
                    <label className="form-label">الفئة</label>
                    <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                    >
                        <option value="">اختر فئة</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.categoryName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* الصورة */}
                <div className="mb-3">
                    <label className="form-label">صورة المنتج</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files?.[0]) setSelectedImageFile(e.target.files[0]);
                        }}
                    />
                </div>

                {/* عرض الصورة الحالية */}
                {isEditMode && formData.imageUrl && (
                    <div className="mb-3">
                        <p>الصورة الحالية:</p>
                        <img
                            src={`${backendURL}/${formData.imageUrl.replace(/^\/+/, "")}`}
                            alt="Current"
                            style={{ maxWidth: "150px" }}
                            crossOrigin="anonymous"
                        />
                    </div>
                )}

                <button type="submit" className="btn btn-primary">
                    {isEditMode ? "💾 حفظ التعديلات" : "➕ إضافة المنتج"}
                </button>
            </form>
        </div>
    );
}
