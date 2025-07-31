  import mongoose, { Schema, Document } from "mongoose";
import { PopulatedCoupon } from "../Coupons/coupons.model";



export interface PopulatedOrder {
  _id: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  status: string;
  totalAmount: number;
  finalAmount: number;
  discount: number;
  walletAmount?: number;
  coupon?: PopulatedCoupon | Schema.Types.ObjectId;
  statusHistory: {
    status: string;
    changedAt: Date;
  }[];
}

interface IOrder extends Document {
  user: Schema.Types.ObjectId;
  items: {
    product: Schema.Types.ObjectId;
    quantity: number;
    type?: string;
    weight?: number;
  }[];
  totalAmount: number;
  code: string;
  discount?: number;
  finalAmount: number;
  coinsEarned: number;
  shippingAddress: string;
  extraAddress: string;
  coupon?: any;
  walletAmount?: number;
  paymentMethod?: string; // ← كمان خلتها optional زي ما انت كاتب في schema
  status:
    | "pending"
    | "delivered"
    | "canceled"
    | "completed"
    | "refunded"
    | "shipped";
  createdAt?: Date;
  updatedAt?: Date;
  statusHistory: {
    status: string;
    changedAt: Date;
  }[];
}



const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        type: { type: String }, 
        weight: { type: Number },
      },
    ],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    coinsEarned: { type: Number, default: 0 },
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    walletAmount: { type: Number, default: 0 },
    shippingAddress: {
      type: String,
      required: true,
    },
    extraAddress: {
      type: String,
    },

    paymentMethod: {
      type: String,
      enum: ["vodafone", "cash", "insta"],
      required: false,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "delivered",
        "canceled",
        "completed",
        "refunded",
        "shipped",
      ],
      default: "pending",
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
          enum: [
            "pending",
            "preparing",
            "shipped",
            "delivered",
            "canceled",
            "refunded",
          ],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);

