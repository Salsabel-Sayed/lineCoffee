import webPush from 'web-push';

webPush.setVapidDetails(
  'mailto:your@email.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);
export default webPush