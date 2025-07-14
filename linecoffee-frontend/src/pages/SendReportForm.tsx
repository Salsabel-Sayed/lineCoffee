import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {  getDecryptedToken } from "../utils/authUtils";

export default function SendReportForm() {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
 const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) return toast.error("Please fill in all fields");

        const token = getDecryptedToken();
        if (!token) return toast.error("User not logged in");

        try {
            await axios.post(`${backendURL}/reports/createReport`, {
                subject,
                message,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Report sent to admin ✅");
            setSubject("");
            setMessage("");
        } catch (err) {
            console.error(err);
            toast.error("Failed to send report");
        }
    };

    return (
        <div>
            <h4>📝 Send Report to Admin</h4>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <input className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea className="form-control" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary">Send</button>
            </form>
        </div>
    );
}
