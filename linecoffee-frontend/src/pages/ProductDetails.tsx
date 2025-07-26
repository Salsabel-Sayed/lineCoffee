import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as fullStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as emptyStar } from "@fortawesome/free-regular-svg-icons";
import { useCart } from "../context/CartContext";
import { useWishList } from "../context/WishListContext";
import { toast } from "react-toastify";
import { getDecryptedToken } from "../utils/authUtils";

interface Review {
  user: {
    _id: string;
    userName: string;
  };
  rating: number;
  comment: string;
}

type Product = {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  category?: string;
  quantity: number;
  averageRating?: number;
};;


function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = [];

  for (let i = 0; i < full; i++) {
    stars.push(<FontAwesomeIcon key={`full-${i}`} icon={fullStar} className="text-warning" />);
  }

  if (half) {
    stars.push(<FontAwesomeIcon key="half" icon={fullStar} className="text-warning opacity-50" />);
  }

  while (stars.length < 5) {
    stars.push(<FontAwesomeIcon key={`empty-${stars.length}`} icon={emptyStar} className="text-warning" />);
  }

  return stars;
}

function StarRatingInput({ rating, setRating }: { rating: number; setRating: (val: number) => void }) {
  return (
    <div className="fs-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} onClick={() => setRating(star)} style={{ cursor: "pointer" }}>
          <FontAwesomeIcon icon={star <= rating ? fullStar : emptyStar} className="me-1 text-warning" />
        </span>
      ))}
    </div>
  );
}

export default function ProductDetails() {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { addToCart } = useCart();
  const { toggleWish, wishList } = useWishList();
  const inWishList = product ? wishList.some((p: { id: string }) => p.id === product.id) : false;

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${backendURL}/products/getProductById/${productId}`);
      setProduct({
        id: res.data.product._id,
        name: res.data.product.productsName,
        description: res.data.product.productsDescription,
        image: `${backendURL}/${res.data.product.imageUrl?.replace(/^\/+/, "")}`,
        price: res.data.product.price,
        averageRating: res.data.product.averageRating,
        quantity: 1,
      });
    } catch (err) {
      console.log("Error fetching product", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const token = getDecryptedToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const res = await axios.get(`${backendURL}/reviews/getProductReviews/${productId}`, { headers });
      setReviews(res.data.reviews);
    } catch (err) {
      console.log("Error fetching reviews", err);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviews();
    }
  }, [productId]);

  const handleReviewSubmit = async () => {
    if (rating < 1) {
      toast.error("من فضلك اختر تقييم من 1 إلى 5 نجوم");
      return;
    }
    
    const token = getDecryptedToken();
    if (!token) return navigate("/login");

    try {
      await axios.post(
        `${backendURL}/reviews/addReview`,
        { product: productId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("تم إرسال التقييم");

      // تحديث البيانات بعد التقييم مباشرة
      setRating(0);
      setComment("");
      await fetchReviews();
      await fetchProduct(); // علشان يتحدث الـ averageRating
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "حدث خطأ أثناء إرسال التقييم");
    }
  };

  const handleAddToCart = () => {
    const token = getDecryptedToken();
    if (!token) {
      toast.warning("برجاء تسجيل الدخول أولاً");
      return navigate("/login");
    }

    if (product) {
      const formattedProduct = {
        id: product.id,
        name: product.name,
        image: product.image || "",
        price: product.price,
        quantity: 1,
      };

      addToCart(formattedProduct);
      toast.success("تمت الإضافة إلى السلة!");
    }
  };

  const handleToggleWish = () => {
    const token = getDecryptedToken();
    if (!token) {
      toast.warning("برجاء تسجيل الدخول أولاً");
      return navigate("/login");
    }

    if (product) {
      const formattedProduct = {
        id: product.id,
        name: product.name,
        image: product.image || "",
        price: product.price,
      };

      toggleWish(formattedProduct);
      toast.success("تمت الإضافة/الإزالة من المفضلة");
    }
  };

  if (!product) return <div className="container mt-5">Product not found!</div>;

  return (
    <div className="container my-5">
      <div className="row gy-4 align-items-start flex-column flex-md-row">
        <div className="col-md-6 text-center">
          <img
            src={product.image}
            alt={product.name}
            className="img-fluid rounded shadow"
            style={{ maxHeight: "400px", objectFit: "contain" }}
            crossOrigin="anonymous"
            
          />
        </div>
        <div className="col-md-6">
          <h2 className="fw-bold">{product.name}</h2>
          <p className="mt-3">{product.description}</p>
          <div className="d-flex align-items-center my-2">
            {renderStars(product.averageRating ?? 0)}
            <span className="ms-2">({(product.averageRating ?? 0).toFixed(1)})</span>
          </div>
          <h4 className="fw-bold text-success mb-3">{product.price} EGP</h4>

          <button
            className={`btn btn-sm ${inWishList ? "btn-warning" : "btn-outline-warning"} me-2`}
            onClick={handleToggleWish}
          >
            {inWishList ? "★ Remove" : "☆ WishList"}
          </button>

          <button className="btn btn-success" onClick={handleAddToCart}>
            🛒 Add to Cart
          </button>
        </div>
      </div>

      <hr className="my-5" />

      <div className="mt-5">
        <h4 className="mb-3">Customer Reviews</h4>
        {Array.isArray(reviews) && reviews.length === 0 ? (
          <p className="">No reviews yet.</p>
        ) : (
          Array.isArray(reviews) &&
          reviews.map((review, index) => (
            <div key={index} className="border rounded p-3 mb-3 shadow-sm">
              <div className="d-flex justify-content-between">
                <strong>{review.user?.userName || "مستخدم غير معروف"}</strong>
                <div>{renderStars(Number(review.rating))}</div>
              </div>
              <p className="mb-0 mt-2">{review.comment || "لا يوجد تعليق"}</p>
            </div>
          ))
        )}
      </div>

      {getDecryptedToken() && (
        <div className="mt-5">
          <h5>أضف تقييمك</h5>
          <StarRatingInput rating={rating} setRating={setRating} />
          <textarea
            className="form-control mt-3"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="اكتب تعليقك هنا..."
          />
          <button className="btn glass-btn mt-3" onClick={handleReviewSubmit}>
            إرسال التقييم
          </button>
        </div>
      )}
    </div>
  );
}
