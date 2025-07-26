import { NextFunction, Request, Response } from "express";
import { catchError } from "../../middlewares/errors/catchError";
import { Products } from "./products.model";
import { AppError } from "../../middlewares/errors/appError";
import mongoose, { Schema } from "mongoose";
import { AuthenticatedRequest } from "../../types/custom";
import { Categories } from './../Categories/categories.models';
import fs from "fs";
import path from "path";



//? create products
  export const createProduct = catchError(
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        productsName,
        productsDescription,
        price,
        category,
        available,
        inStock,
      } = req.body;
      console.log(req.body);
      

      const categoryId = new mongoose.Types.ObjectId(category);
      console.log("caregoryId",categoryId);
      console.log("All Categories:", await Categories.find());

      
      const existingCategory = await Categories.findById(categoryId);
      console.log("existingCategory", existingCategory);
      if (!existingCategory)
        return next(new AppError("Category not found!", 404));

      // الصورة من multer
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      console.log("imageUrl", imageUrl);
      

      const product = await Products.create({
        productsName,
        productsDescription,
        price,
        category: categoryId,
        imageUrl,
        available,
        ratings: [],
        averageRating: 0,
        inStock,
      });
      console.log("Body Data:");
      console.log("productsName:", productsName);
      console.log("productsDescription:", productsDescription);
      console.log("price:", price);
      console.log("category:", category);
      console.log("available:", available);
      console.log("inStock:", inStock);

      console.log("product", product);
      

      res.status(201).json({ message: "Product created successfully!", product });
    }
  );


//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? get all products 
export const getAllProducts = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const matchStage: any = {};

    if (req.query.category) matchStage.category = req.query.category;
    if (req.query.available)
      matchStage.available = req.query.available === "true";

    if (req.query.minPrice || req.query.maxPrice) {
      matchStage.price = {};
      if (req.query.minPrice)
        matchStage.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice)
        matchStage.price.$lte = Number(req.query.maxPrice);
    }

    const productsWithRatings = await Products.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "reviews", // اسم Collection اللي فيه الريفيوهات (غالبًا reviews)
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
        },
      },
      {
        $project: {
          reviews: 0, // لو مش عايزة ترجعي الريفيوهات نفسها
        },
      },
    ]);

    res.status(200).json({ products: productsWithRatings });
  }
);

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? get sepecfic product by id
export const getProductById = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = new mongoose.Types.ObjectId(req.params.id);

    const result = await Products.aggregate([
      { $match: { _id: productId } },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
        },
      },
      {
        $project: {
          reviews: 0,
        },
      },
    ]);

    if (!result.length) return next(new AppError("Product not found!", 404));

    res.status(200).json({ product: result[0] });
  }
);


//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? update product


export const updateProduct = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Products.findById(req.params.id);

    if (!product) return next(new AppError("Product not found!", 404));

    // Update fields
    product.productsName = req.body.productsName || product.productsName;
    product.productsDescription =
      req.body.productsDescription || product.productsDescription;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;

    // If there's a new image, handle it
if (req.file) {
  // حذف الصورة القديمة
  if (product.imageUrl) {
   const oldImagePath = path.join("uploads", path.basename(product.imageUrl));

    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  // تحديث الصورة الجديدة
  product.imageUrl = `/uploads/${req.file.filename}`;

}


    await product.save();

    res.status(200).json({ message: "Product updated successfully!", product });
  }
);


//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? delete product
export const deleteProduct = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Products.findByIdAndDelete(req.params.id);
    if (!product) return next(new AppError("Product not found!", 404));
    res.status(200).json({ message: "Product deleted successfully!" });
});

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? search product
export const searchProducts = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const search = req.query.search as string;
    if (!search) return next(new AppError("Please provide a search query!", 400));
    const products = await Products.find({ productsName: { $regex:search, $options: "i" } });
    res.status(200).json({ products });
});

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? add Review 
export const addReview = catchError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const product = await Products.findById(req.params.id);
    if (!product) return next(new AppError("Product not found!", 404));

    const { rating, comment } = req.body;
    
    // التأكد إن المستخدم مسجل دخول ومعاه `userId`
    if (!req.user?.userId) return next(new AppError("Unauthorized: No user ID found", 401));

    const userId = req.user?.userId as unknown as Schema.Types.ObjectId;
    console.log("userId",userId);
    

    // ✅ التحقق إذا كان المستخدم قيّم المنتج قبل كده
    const existingReview = product.ratings.find((review) => review.userId.toString() === userId.toString());
    if (existingReview) return next(new AppError("You have already reviewed this product!", 400));

    // ✅ التأكد من أن التقييم رقم صحيح بين 1 و 5
    if (rating < 1 || rating > 5) return next(new AppError("Rating must be between 1 and 5", 400));

    // ✅ إضافة التقييم
    product.ratings.push({ userId, rating, comment });

    // ✅ تحديث متوسط التقييم
    const totalRatings = product.ratings.length;
    product.averageRating = product.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await product.save();
    res.status(201).json({ message: "Review added successfully!", product });
});



