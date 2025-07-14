import { useEffect, useState } from "react";
import axios from "axios";
import { getDecryptedToken } from "../utils/authUtils";

type Report = {
    _id: string;
    user: { email: string };
    subject: string;
    message: string;
    createdAt: string;
    isRead: boolean;
};

export default function UserReportsSection() {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [reports, setReports] = useState<Report[]>([]);

    const token = getDecryptedToken();


    const fetchReports = async () => {
        try {
            const { data } = await axios.get(`${backendURL}/reports/getAllReports`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReports(data.reports || []);
        } catch (error) {
            console.error("Error fetching reports", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await axios.put(`${backendURL}/reports/markReportAsRead/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchReports();
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div>
            <h3 className="mb-4">🧑‍💬 User Reports</h3>
            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Subject</th>
                            <th>Message</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report, index) => (
                            <tr key={report._id}>
                                <td>{index + 1}</td>
                                <td>{report.user?.email}</td>
                                <td>{report.subject}</td>
                                <td>{report.message}</td>
                                <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {report.isRead ? (
                                        <span className="badge bg-success">Read</span>
                                    ) : (
                                        <span className="badge bg-warning">Unread</span>
                                    )}
                                </td>
                                <td>
                                    {!report.isRead && (
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => markAsRead(report._id)}>
                                            ✅ Mark as Read
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
