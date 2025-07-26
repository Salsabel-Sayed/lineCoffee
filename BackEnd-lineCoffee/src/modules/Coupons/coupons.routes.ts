import { Router } from "express";
import { verifyToken } from './../../middlewares/token/token';
import { createCoupon, deleteCoupon, generateFirstOrderCoupon, generateSecondOrderCoupon, getAllCoupons, getCouponById, updateCoupon, validateCoupon } from "./coupons.controller";





const CouponsRouter = Router()

// special cases
CouponsRouter.post('/FirstOrCo',generateFirstOrderCoupon);
CouponsRouter.post('/SecondOrCo',generateSecondOrderCoupon)
CouponsRouter.post('/validateCoupon/', verifyToken,validateCoupon);

// CRUD
CouponsRouter.post("/addCoupons",verifyToken, createCoupon);
CouponsRouter.get("/getAllCoupons", verifyToken, getAllCoupons);
CouponsRouter.get("/getCouponById/:id", verifyToken, getCouponById);
CouponsRouter.put("/updateCoupon/:id", verifyToken, verifyToken, updateCoupon);
CouponsRouter.delete("/deleteCoupon/:id", verifyToken, deleteCoupon);

export default CouponsRouter