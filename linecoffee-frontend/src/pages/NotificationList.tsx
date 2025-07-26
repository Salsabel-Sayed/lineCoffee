import { useState } from 'react';
import type { Notification } from "../../Types/notificationTypes";
import useAuthCheck from '../utils/Hooks/UseAuthCheck';

type NotificationsProps = {
    notifications: Notification[];
    onRefresh: () => void;
};

function NotificationsList({ notifications }: NotificationsProps) {
    useAuthCheck();

    const [filter, setFilter] = useState<"all" | Notification["type"]>("all");

    const filteredNotifs = filter === "all"
        ? notifications
        : notifications.filter(n => n.type === filter);


    

    // const handleMarkAsRead = async (notificationId: string) => {
    //     const token = getDecryptedToken();

    //     if (!token) return toast.error("User not logged in");

    //     try {
    //         await axios.put(
    //             `${backendURL}/notifications/markReportAsRead/${notificationId}`,
    //             {},
    //             {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             }
    //         );

    //         toast.success("Marked as read");
    //         onRefresh(); // بعد التحديث نعمل refresh
    //     } catch (err) {
    //         toast.error(`Failed to mark as read ${err}`);
    //     }
    // };

    return (
        <div className="notifications-section">
            <h3 className="mb-3">🔔 Notifications</h3>

            <div className="mb-3 d-flex gap-2 flex-wrap ">
                <button className={`btn btn-sm ${filter === 'all' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setFilter("all")}>All</button>
                <button className={`btn btn-sm ${filter === 'coins' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter("coins")}>🪙 Coins</button>
                <button className={`btn btn-sm ${filter === 'order' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setFilter("order")}>📦 Orders</button>
                <button className={`btn btn-sm ${filter === 'report' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setFilter("report")}>📦 Report</button>
                <button className={`btn btn-sm ${filter === 'promo' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setFilter("promo")}>🎁 Promo</button>
                <button className={`btn btn-sm ${filter === 'general' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setFilter("general")}>📣 General</button>
            </div>

            {filteredNotifs.length === 0 ? (
                <p>No notifications found.</p>
            ) : (
                <ul className="list-group ">
                    {filteredNotifs.map((notif) => (
                        <li
                            key={notif._id}
                            style={{ backgroundColor: getNotifColor(notif.type) }}
                            className={`list-group-item glass-btn ${notif.isRead ? '' : 'fw-bold'}`}
                        >

                            <div className="d-flex justify-content-between align-items-center">
                                <div >
                                    <strong>{notif.title}</strong>
                                    <p className="mb-1">{notif.message}</p>
                                    <small>{new Date(notif.createdAt).toLocaleString()}</small>
                                </div>

                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
function getNotifColor(type: Notification["type"]) {
    switch (type) {
        case "coins":
            return "rgb(109 175 255 / 36%)"; // لون أصفر فاتح مثلًا
        case "order":
            return "rgb(180 255 197 / 39%)"; // أخضر فاتح
        case "report":
            return "rgb(255 178 185 / 32%)"; // أحمر فاتح
        case "promo":
            return "#f7d67266"; // رمادي فاتح
        case "general":
            return "#08f7ff3b"; // أزرق فاتح
        default:
            return "rgba(255, 255, 255, 0.15)"; // أبيض
    }
}


export default NotificationsList;
