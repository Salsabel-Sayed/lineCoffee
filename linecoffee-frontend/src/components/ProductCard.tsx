type ProductCardProps = {
    image: string;
    name: string;
    price: number;
    quantity: number;
    onRemove: () => void;
    onQuantityChange: (value: number) => void;
};
const backendURL = import.meta.env.VITE_BACKEND_URL;

export default function ProductCard({
    image,
    name,
    price,
    quantity,
    onRemove,
    onQuantityChange,
}: ProductCardProps) {
    return (
<section className="productCard">
            <div className="d-flex flex-row-reverse justify-align-content-around align-items-center p-3 mb-3 glass-btn"
                dir="rtl">
                <img src={
                    image.startsWith("http")
                        ? image // الصورة فيها لينك كامل
                        : `${backendURL}/${image?.replace(/^\/+/, "")}` // مسار نسبي
                }
                    alt={name}
                    crossOrigin="anonymous"
                    style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginLeft: "10px",
                        marginRight: "30px",

                    }} />
                    <div>
                    <h6 className="fw-bold mb-1">{name}</h6>
                    <p className=" mb-2">{price} جنيه</p>
                    </div>
                <div className="flex-grow-1">
                   

                    <div className="d-flex align-items-center gap-2">
                        <select
                            className="form-select form-select-sm w-auto"
                            value={quantity}
                            onChange={(e) => onQuantityChange(Number(e.target.value))}
                        >
                            {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                        <span className="small ">الكمية</span>
                        <button
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={onRemove}
                        >
                            🗑️ إزالة
                        </button>
                    </div>
                </div>
            </div>
</section>
    );
}
  