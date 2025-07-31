
import mongoose, { Schema, model, Document } from "mongoose";

// تعريف واجهة TypeScript لمستخدم
interface IProducts extends Document {
  productsName: string;
  productsDescription?: string;
  price: number;
  category: Schema.Types.ObjectId;
  imageUrl?: string;
  available: boolean;
  availableVariants: {
    type: string;
    weights: {
      weight: number;
      price: number;
    }[];
  }[];

  inStock: number;
  ratings: {
    userId: Schema.Types.ObjectId;
    rating: number;
    comment?: string;
  }[];
  averageRating?: number;
  numOfReviews: number;
  createdAt: Date;
  userId: mongoose.Schema.Types.ObjectId;
}

// إنشاء مخطط Mongoose مع تحديد الأنواع
const productsSchema = new Schema<IProducts>(
  {
    productsName: { type: String, required: true, index: true },
    productsDescription: { type: String },
    price: { type: Number, min: 0 },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Categories",
      required: true,
    },
    imageUrl: { type: String },
    available: { type: Boolean, default: true },
    inStock: { type: Number },
    availableVariants: [
  {
    type: {
      type: String,
      required: true,
    },
    weights: [
      {
        weight: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
],


    ratings: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

// إنشاء الموديل بناءً على المخطط
export const Products = model<IProducts>("Products", productsSchema);
export type { IProducts };
