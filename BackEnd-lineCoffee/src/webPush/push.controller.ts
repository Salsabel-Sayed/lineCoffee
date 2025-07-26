// pushController.ts
import webpush from "web-push";
import { Request, Response } from "express";
import { Subscription } from "./push.model";


webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const saveSubscription = async (req: Request, res: Response) => {
  const subscription = req.body;
  await subscription.create(subscription);
  res.status(201).json({ message: "Subscription saved" });
};

export const sendNotification = async (req: Request, res: Response) => {
  const subscriptions = await Subscription.find();
  const payload = JSON.stringify({
    title: "📢 New Message",
    body: "Check your dashboard!",
  });

  subscriptions.forEach((sub:any) => {
    webpush
      .sendNotification(sub, payload)
      .catch((err) => console.error("Push Error:", err));
  });

  res.status(200).json({ message: "Notifications sent" });
};
