import { useEffect } from "react";

const PUBLIC_KEY = "BIsgFsq4-lmlf924Nx5o9T_MWyyhrDLRMkVaoQTUjadCF1AS7QRbyTK3--RK1MfOzv9oJ0bP7p-C-0gKqhGtfQg"; // نفس الـ public key اللي طلعناها فوق

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export default function NotificationSetup() {
    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            navigator.serviceWorker.register("/service-worker.js").then((reg) => {
                Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                        reg.pushManager
                            .subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
                            })
                            .then((subscription) => {
                                // ابعتي الاشتراك للباك
                                fetch("http://localhost:5000/api/notifications/subscribe", {
                                    method: "POST",
                                    body: JSON.stringify(subscription),
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                });
                            });
                    }
                });
            });
        }
    }, []);

    return null;
}
