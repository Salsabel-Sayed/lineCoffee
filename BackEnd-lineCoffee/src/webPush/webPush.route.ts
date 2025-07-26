// routes/notifications.ts
import express from "express";
// import { webpush } from 'web-push';
import webpush from "../webPush/webPush"

const webPushrouter = express.Router();

let subscriptions: any[] = []; // مؤقتاً، أو خزنهم في DB

webPushrouter.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: "Subscription saved" });
});

// Route لإرسال إشعار:
webPushrouter.post("/notify", async (req, res) => {
  const { title, body } = req.body;

  const payload = JSON.stringify({
    title,
    body,
  });

  try {
    for (let sub of subscriptions) {
      await webpush.sendNotification(sub, payload);
    }
    res.status(200).json({ message: "Notifications sent" });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default webPushrouter;
