// pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY, TOKEN_KEY } from "../utils/authUtils";
import { loginSchema } from "./Schema/LoginValidation";


interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    logging?: boolean;
}

export default function Login() {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // ✅ Validate single field on blur
    const validateField = (name: string, value: string) => {
        const fieldSchema = loginSchema.extract(name);
        const { error } = fieldSchema.validate(value);
        setErrors((prev) => ({
            ...prev,
            [name]: error ? error.message : "",
        }));
    };

    useEffect(() => {
        document.body.style.overflow = isLoading ? "hidden" : "auto";
    }, [isLoading]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const { error } = loginSchema.validate({ email, password }, { abortEarly: false });

        if (error) {
            const fieldErrors: { [key: string]: string } = {};
            error.details.forEach((detail) => {
                const field = detail.path[0] as string;
                fieldErrors[field] = detail.message;
            });
            setErrors(fieldErrors);
            toast.error("Please fix the highlighted errors.");
            return;
        }

        try {
            const response = await axios.post(`${backendURL}/users/logIn`, { email, password });
            setIsLoading(true);

            const { authorization: token, message } = response.data;

            const decodedToken = jwtDecode<JwtPayload>(token);
            localStorage.setItem("userId", decodedToken.userId);
            localStorage.setItem(
                "user",
                JSON.stringify({ email: decodedToken.email, role: decodedToken.role })
            );

            const encrypted = CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
            localStorage.setItem(TOKEN_KEY, encrypted);

            toast.success(message || "Logged in successfully!");
            setTimeout(() => {
                navigate("/");
                window.location.reload();
            }, 2000);
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            const errorMsg = err.response?.data?.message || "Login failed";

            setErrors((prev) => ({
                ...prev,
                general: errorMsg,
            }));

            toast.error(errorMsg);
        }
    };



    return (
        <>
            {isLoading && (
                <div className="page-loader">
                    <div className="loader-content">🔐 Logging in...</div>
                </div>
            )}

            <section className="login glass-effect">
                <div className="container mt-5">
                    <h2 className="mb-4">🔐 Login</h2>
                    <form onSubmit={handleLogin} className="p-4 rounded">
                        <div className="mb-3">
                            <label>Email:</label>
                            <input
                                type="email"
                                className={`form-control glass-btn ${errors.email ? "is-invalid" : ""}`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={(e) => validateField("email", e.target.value)}
                            />
                            {errors.email && <div className="text-danger mt-1">{errors.email}</div>}
                        </div>

                        <div className="mb-3">
                            <label>Password:</label>
                            <input
                                type="password"
                                className={`form-control glass-btn ${errors.password ? "is-invalid" : ""}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={(e) => validateField("password", e.target.value)}
                            />
                            {errors.password && <div className="text-danger mt-1">{errors.password}</div>}
                        </div>

                        <button type="submit" className="btn glass-btn w-100">
                            Login
                        </button>
                        {errors.general && (
                            <div className="text-danger text-center mt-3">{errors.general}</div>
                        )}

                    </form>
                </div>
            </section>
        </>
    );
}
