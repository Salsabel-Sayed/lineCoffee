export type NotificationData = {
  coins?: number;
  action?: string;
  orderCode?: string;
  discount?: string | number;
  [key: string]: string | number | undefined |boolean ; // احتياطي لو فيه بيانات إضافية مش متوقعة
};

export type Notification = {
  _id: string;
  title: string;
  message: string;
  type: "order" | "coins" | "promo" | "general" | "report";
  createdAt: string;
  isRead: boolean;
  data: NotificationData; // ✅ هنا التغيير
};
