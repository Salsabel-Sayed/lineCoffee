import { NextFunction, Request, Response } from "express";
import { AppError } from "../../middlewares/errors/appError";
import { catchError } from "../../middlewares/errors/catchError";
import { AuthenticatedRequest } from "../../types/custom";
import { Products } from "../Products/products.model";
import { Order } from "../Orders/order.model";
import { Review } from "./review.model";

// //* ////////////////////////////////////////////////////////////////////////////////////////////////////
// //? calculate Average Rating
const calculateAverageRating = async (productId: string) => {
  const reviews = await Review.find({ product: productId });

  const numOfReviews = reviews.length;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = numOfReviews ? totalRating / numOfReviews : 0;

  await Products.findByIdAndUpdate(productId, {
    numOfReviews,
    averageRating: Number(averageRating.toFixed(1)), // خليه Number مش String
  });
};


//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? add review 
export const addReview = catchError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { product, rating, comment } = req.body;

    if (!product || rating === undefined || rating === null)
      return next(new AppError("Product ID and rating are required!", 400));

    const productDoc = await Products.findById(product);
    if (!productDoc) return next(new AppError("Product not found!", 404));

    // ✅ تأكيد إن المستخدم اشترى المنتج قبل ما يعمل Review
    const hasPurchased = await Order.findOne({ user: req.user?.userId, "items.product": product });
    if (!hasPurchased) return next(new AppError("You must purchase the product before reviewing!", 403));

    // ✅ إضافة الـ Review الجديد
    await Review.create({
        user: req.user?.userId,
        product,
        rating,
        comment,
    });
    await calculateAverageRating(product);
    const reviews = await Review.find({ product }).populate(
      "user",
      "userName"
    );

    res.status(201).json({ message: "Review added successfully!",reviews });
});

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? get Product Reviews 
export const getProductReviews = catchError(async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;

  const reviews = await Review.find({ product: productId }).populate(
    "user",
    "userName"
  ); // ✅ جلب اسم المستخدم
  res.status(200).json({ reviews }); 
});

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? delete Review(only admin) done
export const deleteReview = catchError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) return next(new AppError("Review not found!", 404));

    // ✅ تأكيد إن الأدمن هو اللي بيحذف
    if (req.user?.role !== "admin") return next(new AppError("Only admins can delete reviews!", 403));


    await Review.findByIdAndDelete(reviewId);
    await calculateAverageRating(review.product.toString());

    res.status(200).json({ message: "Review deleted successfully!" });
});

