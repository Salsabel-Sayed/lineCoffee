import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getCategoriesWithProductCount, getCategoryById, updateCategory } from "./categories.controller";
import upload from "../../middlewares/multer/uploads";



const categoriesRouter = Router()

categoriesRouter.post("/addCategory", upload.single("categoryImage"), createCategory);
categoriesRouter.get('/getAllCategories',getAllCategories)
categoriesRouter.get('/getCategoryById/:id',getCategoryById)
categoriesRouter.put('/updateCategory/:id', upload.single("categoryImage"),updateCategory)
categoriesRouter.delete('/deleteCategory/:id',deleteCategory)

categoriesRouter.get('/getCategoriesWithProductCount/',getCategoriesWithProductCount)

export default categoriesRouter


