import { useEffect, useState } from "react";
import NotificationsList from "./NotificationList";
import type { Notification } from "../../Types/notificationTypes";
import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY, TOKEN_KEY } from "../utils/authUtils";
import useAuthCheck from "../utils/Hooks/UseAuthCheck";

function NotificationWrapper() {
    useAuthCheck();
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const getDecryptedToken = () => {
        const encrypted = localStorage.getItem(TOKEN_KEY);
        if (!encrypted) return null;
        try {
            const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (err) {
            console.log("Failed to decrypt token:", err);
            return null;
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = getDecryptedToken();
            if (!token) return;

            const res = await fetch(`${backendURL}/notifications/getUserNotifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            console.log("Notifications response:", data);
            setNotifications(data.notifications || []);
        } catch (err) {
            console.log("Error fetching notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <NotificationsList
            notifications={notifications}
            onRefresh={fetchNotifications}
        />
    );
}

export default NotificationWrapper;
