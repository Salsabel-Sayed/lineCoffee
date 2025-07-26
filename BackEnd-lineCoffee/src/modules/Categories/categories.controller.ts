import { NextFunction, Request, Response } from "express";
import { catchError } from "../../middlewares/errors/catchError";
import { Categories, ICategories } from "./categories.models";
import { AppError } from "../../middlewares/errors/appError";
import fs from "fs";
import path from "path";



//? create categories (admin)
export const createCategory = catchError(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { categoryName, categoryDescription } = req.body;

    const categoryData: Partial<ICategories> = {
      categoryName,
      categoryDescription,
      createdAt: new Date(),
    };

    // ✅ حفظ الصورة
 if (req.file) {
   const imageUrl = `/uploads/${req.file.filename}`;
   categoryData.image = imageUrl;
 }


    const category = await Categories.create(categoryData);

    res
      .status(201)
      .json({ message: req.__("Category created successfully!"), category });
  }
);



//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? get all categories (user)
export const getAllCategories = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await Categories.find();
    res.status(200).json({ message:"all categories", categories });
});

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? get sepesific category (user)
export const getCategoryById = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const category = await Categories.findById(req.params.id);
    if (!category) return next(new AppError("Category not found!", 404));
    res.status(200).json({ category });
});

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? update category (admin)

export const updateCategory = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const existingCategory = await Categories.findById(req.params.id);
    if (!existingCategory)
      return next(new AppError("Category not found!", 404));

    // إعداد الداتا الجديدة
    const updatedData: any = {
      categoryName: req.body.categoryName,
      categoryDescription: req.body.categoryDescription,
    };

    // ✅ لو فيه صورة جديدة
    if (req.file) {
      // حذف الصورة القديمة لو موجودة
      if (existingCategory.image) {
        const oldImagePath = path.join(
          "uploads",
          path.basename(existingCategory.image)
        );

        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }

      updatedData.image = `/uploads/${req.file.filename}`;


    }

    const category = await Categories.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Category updated successfully!", category });
  }
);
//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? delete category (admin)
export const deleteCategory = catchError(async (req: Request, res: Response, next: NextFunction)=>{
    const category = await Categories.findByIdAndDelete(req.params.id);
    if (!category) return next(new AppError("Category not found!", 404));
    res.status(200).json({ message: "Category deleted successfully!" });
})

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? get product in spesific category
// export const getProductsByCategory = catchError(async (req: Request, res: Response, next: NextFunction) => {
//     const products = await Product.find({ category: req.params.id });
//     res.status(200).json({ products });
// });

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? aggregate : Filter categories by number of products

export const getCategoriesWithProductCount = catchError(async (req: Request, res: Response, next: NextFunction) => {
    const minProducts = parseInt(req.query.minProducts as string) || 0;

    const categories = await Categories.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "category",
                as: "products"
            }
        },
        {
            $addFields: { productCount: { $size: "$products" } }
        },
        {
            $match: { productCount: { $gte: minProducts } }
        },
        {
            $project: { products: 0 } // استبعاد المنتجات من النتيجة النهائية
        }
    ]);

    res.status(200).json({ categories });
});