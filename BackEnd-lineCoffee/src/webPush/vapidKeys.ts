import webPush from 'web-push';

const vapidKeys = webPush.generateVAPIDKeys();
console.log("vapidKeys", vapidKeys);
