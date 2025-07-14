import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";



type Category = {
  _id: string;
  categoryName: string;
  image?: string;
};
function CategoriesBase() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${backendURL}/categories/getAllCategories`);
        setCategories(data.categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);




  return (
    <section id="categoriesBase" className="glass-section">
      <div className="container">
        <div className="addrs">
          <h1>{t("home.seeMore")}</h1>
        </div>

        <div className="row">
          {categories.map((cat) => (
            <div key={cat._id} className="col-md-4 mb-4">
              <div className="oneSide">
                <img src={`${backendURL}/${cat.image?.replace(/^\/+/, "") || "images/cup-20.webp"}`} />

                <div className="bodyCard">
                  <h4>{cat.categoryName}</h4>
                  <p>
                    <small>
                      {/* تقدر تجيبي وصف من الـ API لو حابة */}
                      {t("home.seeMore")} products for {cat.categoryName}
                    </small>
                  </p>
                  <button
                    onClick={() => navigate(`/products?category=${cat._id}`)}
                    className="btn btn-primary"
                  >
                    {t("home.seeMore")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoriesBase