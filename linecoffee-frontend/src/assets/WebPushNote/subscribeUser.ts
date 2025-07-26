

export const subscribeUser = async () => {
const backendURL = import.meta.env.VITE_BACKEND_URL;
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.register(
      '/serviceWorker.js'
    );

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: '<YOUR_PUBLIC_VAPID_KEY>', // من الباك
    });

    // ابعت الاشتراك للسيرفر
    await fetch(`${backendURL}/api/notifications/subscribe`, {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
