import { NextFunction, Request, Response } from "express";
import { AppError } from "../../middlewares/errors/appError";
import { catchError } from "../../middlewares/errors/catchError";
import { AuthenticatedRequest } from "../../types/custom";
import { IUser, User } from "../Users/users.models";
import { Products } from "../Products/products.model";
import { Coupon, PopulatedCoupon, UserCoupon } from "../Coupons/coupons.model";
import { calculateCoins } from "../Coins/coins.controller";
import { Order, PopulatedOrder } from "./order.model";
import twilio from "twilio";
import { sendNotification } from "../Notifications/notification.controller";
import { Coins } from "../Coins/coins.model";
import { IWallet, Wallet } from "../Wallet/wallet.model";
import { Payment } from "../Payments/Payment.model";
import { Schema, Types } from "mongoose";
import { ICoupon } from "../Coupons/coupons.model"; 



//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? create Order
export const createOrder = catchError(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { items, couponCode, walletAmount } = req.body;

    if (!items || !items.length)
      return next(new AppError("No items in the order!", 400));

    const user = (await User.findById(userId).populate("wallet")) as IUser;

    if (!user) return next(new AppError("User not found!", 404));

    
    const wallet = user.wallet as IWallet;

    if (!wallet || wallet.balance === undefined) {
      return next(new AppError("Wallet not found!", 404));
    }
    let totalAmount = 0;
    for (const item of items) {
      const product = await Products.findById(item.product);
      if (!product)
        return next(
          new AppError(`Product with ID ${item.product} not found!`, 404)
        );
      totalAmount += product.price * item.quantity;
    }

    let discount = 0;
    let finalAmount = totalAmount;
    let coupon: ICoupon | null = null;

    if (couponCode) {
      coupon = (await Coupon.findOne({
        couponCode,
        isActive: true,
      })) as ICoupon | null;

      if (!coupon) {
        return next(new AppError("Invalid or inactive coupon!", 400));
      }

      const hasUsed = user.coupons?.some(
        (entry) =>
          entry.couponId?.toString() === coupon?._id?.toString() && entry.used
      );

      if (hasUsed) {
        return next(new AppError("You already used this coupon!", 400));
      }

      discount = (totalAmount * coupon.discountPercentage) / 100;
      finalAmount -= discount;
    }

    if (walletAmount && walletAmount > 0) {
      if (walletAmount > wallet.balance) {
        return next(new AppError("Insufficient wallet balance!", 400));
      }
      finalAmount -= walletAmount;
    }

    const newOrder = await Order.create({
      user: userId,
      items,
      totalAmount,
      discount,
      finalAmount,
      coupon,
      walletAmount,
    });

    // ✅ تحديث حالة الكوبون في بيانات المستخدم
    if (coupon) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          coupons: {
            couponId: coupon._id,
            used: true,
            usedAt: new Date(),
          },
        },
      });
    }

    res.status(201).json({ success: true, order: newOrder });
  }
);

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? get coin after deleiver order
// Order controller: completeOrder
export const completeOrder = catchError(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { paymentMethod, walletAmount } = req.body;
    const { orderId } = req.params;

    if (!orderId || !paymentMethod || !walletAmount) {
      return next(
        new AppError("Order ID and payment method are required!", 400)
      );
    }

    const order = await Order.findById(orderId).populate("coupon");
    if (!order || order.status !== "pending") {
      return next(new AppError("Order not found or already completed!", 400));
    }

    const user = await User.findById(order.user)
      .populate("coupons")
      .populate<{ wallet: IWallet }>("wallet");

    if (!user) return next(new AppError("User not found!", 404));

    // حساب الخصم
    const populatedCoupon = order.coupon as
      | (PopulatedCoupon & { _id: Schema.Types.ObjectId })
      | null;
    let discountAmount = 0;

    if (populatedCoupon && populatedCoupon.discountValue) {
      discountAmount = populatedCoupon.discountValue;
      order.discount = discountAmount;
      order.finalAmount = order.totalAmount - discountAmount;
    } else {
      order.finalAmount = order.totalAmount;
    }

    let paymentStatus: "success" | "pending" | "failed" = "pending";

    // إذا كان في مبلغ من المحفظة
    if (order.walletAmount && order.walletAmount > 0) {
      if (user.wallet.balance < order.walletAmount) {
        return next(new AppError("Insufficient wallet balance!", 400));
      }

      user.wallet.balance -= order.walletAmount; // خصم المبلغ من المحفظة
      await user.wallet.save();

      order.finalAmount -= order.walletAmount; // خصم المبلغ من المجموع النهائي
    }

    // إذا كان الدفع كاش أو فودافون
    if (
      paymentMethod === "vodafone" ||
      paymentMethod === "cash" ||
      paymentMethod === "insta"
    ) {
      paymentStatus = "pending"; // الدفع عبر الكاش أو فودافون
    } else {
      return next(new AppError("Invalid payment method!", 400));
    }

    // التحقق إذا كان الـ payment موجودة بالفعل (إذا كان تم الدفع سابقًا)
    const existingPayment = await Payment.findOne({ orderId: order._id });

    if (existingPayment) {
      // إذا كانت الـ Payment موجودة، بنحدث الحالة أو المبلغ
      existingPayment.status = paymentStatus;
      existingPayment.amount = order.finalAmount; // تحديث المبلغ النهائي إذا لزم الأمر
      await existingPayment.save();
    } else {
      // إذا لم تكن الـ Payment موجودة، بننشئ Payment جديدة
      const payment = await Payment.create({
        userId: user._id,
        orderId: order._id,
        method: paymentMethod,
        amount: order.finalAmount,
        status: paymentStatus,
      });
    }

    // تحديث حالة الكوبون نفسه
    if (populatedCoupon && paymentStatus as string === "success") {
      await Coupon.findByIdAndUpdate(populatedCoupon._id, { status: "used" });
    }

    order.paymentMethod = paymentMethod;
    await order.save();
    await sendNotification(
      (user._id as Types.ObjectId).toString(),
      "Order Placed Successfully 🎉",
      `Your order #${order._id} has been placed and is currently pending. Total: ${order.finalAmount} EGP.`,
      "order"
    );
    
    

    const orderInfo = await Order.findById(orderId).populate([
      { path: "user", select: "userName userPhone" },
      { path: "items.product", select: "productsName price" },
      { path: "coupon", select: "couponCode discountValue" },
    ]);

    if (!orderInfo) {
      return next(new AppError("Order information not found!", 404));
    }

   

    res.status(200).json({
      message: `Order completed and waiting for payment via ${paymentMethod}.`,
      orderInfo,
    });
  }
);

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? get Order by id
export const getOrderById = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user");

    if (!order) return next(new AppError("Order not found!", 404));
    res.status(200).json({ order });
  }
);

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? get all Orders(admin)
  export const getAllOrders = catchError(
    async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ): Promise<any> => {
      const { userId, role } = req.user!;

      if (!userId) {
        return next(new AppError("User not found", 404));
      }

      // لو المستخدم Admin هنعرض جميع الأوردرات
      const filter = role === 'admin' ? {} : { user: userId };

      const orders = await Order.find(filter)
        .populate("user", "email")
        .populate("items.product", "productsName")
        .populate("coupon", "couponCode discount")
        .sort({ createdAt: -1 });
        console.log(orders);

      res.status(200).json({ orders });
    }
  );

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? get User Orders(user)
export const getUserOrders = catchError(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.user?.userId;
     console.log("Getting orders for userId:", id);
     const orders = await Order.find({ user: id })
       .populate({ path: "items.product", select: "productsName" }) // ✅
       .select(
         "items totalAmount finalAmount discount walletAmount coupon status createdAt"
       );
    console.log("orders",orders);
    
    res.status(200).json({ orders });
  }
);
//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? update Order (user)
export const updateOrder = catchError(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { items, removedItems, couponCode, walletAmount, ...rest } = req.body;

    const order = await Order.findById(id);
    if (!order) return next(new AppError("Order not found", 404));

    // نبدأ من النسخة الحالية للـ items
    let updatedItems = [...order.items];

    // حذف منتجات لو موجود removedItems
    if (removedItems && Array.isArray(removedItems)) {
      updatedItems = updatedItems.filter(
        (item: any) => !removedItems.includes(item.product.toString())
      );
    }

    // تعديل كميات أو إضافة منتجات جديدة
    if (items && Array.isArray(items)) {
      for (const newItem of items) {
        const index = updatedItems.findIndex(
          (item: any) => item.product.toString() === newItem.product
        );

        if (index !== -1) {
          // لو المنتج موجود بالفعل، نحدث الكمية
          updatedItems[index].quantity = newItem.quantity;
        } else {
          // لو منتج جديد، نضيفه
          updatedItems.push({
            product: newItem.product,
            quantity: newItem.quantity,
          });
        }
      }
    }

    // حساب المبلغ الجديد بناءً على المنتجات المعدلة
    let totalAmount = 0;
    for (const item of updatedItems) {
      const product = await Products.findById(item.product);
      if (!product)
        return next(
          new AppError(`Product with ID ${item.product} not found!`, 404)
        );
      totalAmount += product.price * item.quantity;
    }

    let updateFields: any = {
      ...rest,
      items: updatedItems,
      totalAmount,
      finalAmount: totalAmount, // يتم حساب المبلغ النهائي أولاً
    };

    // إذا كان هناك كوبون مضاف
    if (couponCode) {
      const coupon = await Coupon.findOne({
        couponCode,
        isActive: true,
        isUsed: false,
      });

      if (coupon) {
        const discount = (totalAmount * coupon.discountPercentage) / 100;
        updateFields.discount = discount;
        updateFields.finalAmount = totalAmount - discount - walletAmount;

        updateFields.coupon = coupon._id;
      }
    }

    // إذا كان هناك WalletAmount مضاف
    if (walletAmount && walletAmount > 0) {
      if (walletAmount <= updateFields.finalAmount) {
        // خصم من المبلغ النهائي
        updateFields.finalAmount -= walletAmount;
        updateFields.walletAmount = walletAmount; // تحديث المبلغ في المحفظة
      } else {
        // إذا كان المبلغ في المحفظة أكبر من المجموع النهائي، نعدل المبلغ النهائي ليصبح صفر
        updateFields.finalAmount = 0;
        updateFields.walletAmount = walletAmount; // تحديث المبلغ في المحفظة
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateFields, {
      new: true,
    })
      .populate({
        path: "items.product",
        select: "productsName",
      })
      .populate({
        path: "user",
        select: "userName userPhone",
      });
      await Payment.findOneAndUpdate(
        { orderId: id },
        {
          amount: updateFields.finalAmount,
          method: updateFields.paymentMethod || order.paymentMethod,
        }
      );

    // إرسال رسالة واتساب بالتعديلات
    // try {
    //   await sendWhatsAppEditedOrder(updatedOrder);
    // } catch (error) {
    //   console.error("Failed to send WhatsApp update message:", error);
    // }

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  }
);

//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? cancel Order
export const cancelOrder = catchError(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return next(new AppError("Order not found", 404));

    // فك الكوبون لو موجود
    if (order.coupon) {
      await Coupon.findByIdAndUpdate(order.coupon, {
        isUsed: false,
      });
    }

    // خصم الكوينز لو كانت اتضافت
    if (order.coinsEarned && order.user) {
      await User.findByIdAndUpdate(order.user, {
        $inc: { coins: -order.coinsEarned },
      });
    }

    await order.deleteOne(); // حذف الأوردر

    // رسالة واتساب للعميل
    

    res.status(200).json({ message: "Order deleted successfully" });
  }
);
//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? update Order Status(admin)
export const AdminUpdateOrderStatus = catchError(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id)
      .populate<{ user: IUser }>("user")
      .populate("coupon");

    if (!order) return next(new AppError("Order not found", 404));
    const user = order.user;
    const previousStatus = order.status;

    console.log(`Previous: ${previousStatus}, New: ${status}`);

    // ✅ لو الأوردر كان delivered وراجعناه لأي حالة تانية
    if (previousStatus === "delivered" && status !== "delivered") {
      // 🪙 نحذف الكوينز من المستخدم
      if (order.coinsEarned && order.coinsEarned > 0) {
        const userCoins = await Coins.findOne({ userId: user._id });
        if (userCoins) {
          userCoins.coins -= order.coinsEarned;
          if (userCoins.coins < 0) userCoins.coins = 0;
          await userCoins.save();
        }
      }

      // 🎟 نفعل الكوبون تاني
      if (order.coupon) {
        await Coupon.findByIdAndUpdate(order.coupon._id, {
          isUsed: false,
          isActive: true,
        });
      }

      // نحذف الكوينز من الأوردر
      order.coinsEarned = 0;
    }

    // ✅ لو الأوردر دلوقتي اتعمله delivered لأول مرة
    if (previousStatus !== "delivered" && status === "delivered") {
      const coinsEarned = Math.floor(order.finalAmount / 10);
      let userCoins = await Coins.findOne({ userId: user._id });

      if (!userCoins) {
        userCoins = new Coins({
          userId: user._id,
          coins: coinsEarned,
        });
      } else {
        userCoins.coins += coinsEarned;
      }

      await userCoins.save();

      order.coinsEarned = coinsEarned;

      if (order.coupon) {
        await Coupon.findByIdAndUpdate(order.coupon._id, {
          isUsed: true,
          isActive: false,
        });
      }
    }

    // ✅ لو الأوردر عملنا له Refund بعد ما كان Delivered
    if (previousStatus === "delivered" && status === "refunded") {
      // نرجع الكوينز فقط
      if (order.coinsEarned && order.coinsEarned > 0) {
        const userCoins = await Coins.findOne({ userId: user._id });
        if (userCoins) {
          userCoins.coins -= order.coinsEarned;
          if (userCoins.coins < 0) userCoins.coins = 0;
          await userCoins.save();
        }

        // نحتفظ بالكوبون والمبلغ المدفوع من المحفظة زي ما هو
        order.coinsEarned = 0;
      }
    }

    // ✅ في كل الحالات نحدث الحالة
    order.status = status;
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    
    order.statusHistory.push({
      status,
      changedAt: new Date(),
    });
    
    await order.save();

    res.status(200).json({
      message: `Order status updated to ${status}`,
      order,
    });
  }
);


//* ////////////////////////////////////////////////////////////////////////////////////////////////////
//? admin Update Order(admin)
export const adminUpdateOrder = catchError(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { items, couponCode, removeCoupon, walletAmount, status, ...rest } =
      req.body;

    const order = await Order.findById(id);
    if (!order) return next(new AppError("Order not found", 404));

    // ✅ تعديل العناصر
    if (items && Array.isArray(items)) {
      order.items = items;
    }

    // ✅ تعديل الكوبون
    if (removeCoupon && order.coupon) {
      await Coupon.findByIdAndUpdate(order.coupon, {
        isUsed: false,
        isActive: true,
      });
      order.coupon = undefined;
      order.discount = 0;
    } else if (couponCode) {
      const coupon = await Coupon.findOne({
        couponCode,
        isActive: true,
        isUsed: false,
      });
      if (!coupon) return next(new AppError("Coupon invalid", 400));

      const discount = (order.totalAmount * coupon.discountPercentage) / 100;
      order.discount = discount;
      order.coupon = coupon._id;
    }

    // ✅ تعديل المحفظة
    if (typeof walletAmount === "number") {
      order.walletAmount = walletAmount;
    }

    // ✅ إعادة حساب finalAmount
    order.finalAmount =
      order.totalAmount - (order.discount || 0) - (order.walletAmount || 0);

    // ✅ تعديل الحالة
    if (status) {
      order.status = status;
    }

    // ✅ تعديل أي حاجات إضافية من الـ rest
    Object.assign(order, rest);

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate("items.product", "productsName")
      .populate("user", "email")
      .populate("coupon", "couponCode discountValue");

    res.status(200).json({
      message: "Order updated successfully by admin",
      order: updatedOrder,
    });
  }
);







