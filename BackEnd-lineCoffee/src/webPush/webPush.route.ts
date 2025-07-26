import express from "express";
import { saveSubscription, sendNotification } from "./push.controller";



const webPushrouter = express.Router();

webPushrouter.post("/subscribe", saveSubscription); // ✅ يحفظ في DB
webPushrouter.post("/notify", sendNotification); // ✅ يرسل لكل الاشتراكات

export default webPushrouter;
