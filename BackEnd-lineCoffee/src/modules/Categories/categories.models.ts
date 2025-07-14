
import { Schema, model, Document } from "mongoose";

// تعريف واجهة TypeScript لمستخدم
interface ICategories extends Document {
  categoryName: string;
  categoryDescription?: string;
  createdAt: Date;
  image?: string;
}

// إنشاء مخطط Mongoose مع تحديد الأنواع
const categoriesSchema = new Schema<ICategories>(
    {
    categoryName: { type: String, required: true, unique: true },
    categoryDescription: { type: String },
    createdAt: { type: Date, default: Date.now },
      image: { type: String },
    },
    
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// إنشاء الموديل بناءً على المخطط
export const Categories = model<ICategories>(
  "Category",
  categoriesSchema,
  "categories"
);

export type { ICategories };
