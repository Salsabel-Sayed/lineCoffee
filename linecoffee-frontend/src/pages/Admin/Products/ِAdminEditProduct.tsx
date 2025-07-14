import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

type Category = {
    _id: string;
    categoryName: string;
};

export default function AdminEditProduct() {
    const { productId } = useParams();
    const isEditMode = !!productId;
    const navigate = useNavigate();
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const [formData, setFormData] = useState({
        productsName: "",
        productsDescription: "",
        price: 0,
        category: "",
        imageUrl: "",
    });

    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  

    const [categories, setCategories] = useState<Category[]>([]);
      

    // Load product data if editing
    useEffect(() => {
        if (isEditMode) {
            axios
                .get(`${backendURL}/products/getProductById/${productId}`)
                .then((res) => {
                    const product = res.data.product;
                    setFormData({
                        productsName: product.productsName,
                        productsDescription: product.productsDescription,
                        price: product.price,
                        category: product.category,
                        imageUrl: product.imageUrl,
                    });
                })
                .catch((err) => console.log("Error loading product:", err));
        }
    }, [productId, backendURL, isEditMode]);

    // Load categories
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
        form.append("price", String(formData.price));
        form.append("category", formData.category);
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

                {/* السعر */}
                <div className="mb-3">
                    <label className="form-label">السعر</label>
                    <input
                        type="number"
                        className="form-control"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: +e.target.value })}
                        required
                    />
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
                        {categories.map((cat: Category) => (
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

                {/* عرض الصورة الحالية لو بنعدل */}
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

                {/* زرار حفظ */}
                <button type="submit" className="btn btn-primary">
                    {isEditMode ? "💾 حفظ التعديلات" : "➕ إضافة المنتج"}
                </button>
            </form>
        </div>
    );
}
