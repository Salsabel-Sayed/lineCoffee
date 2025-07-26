// hooks/useAuthCheck.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { clearToken, getDecryptedToken } from "../authUtils";

type DecodedToken = {
  id: string;
  email: string;
  exp: number;
};


const useAuthCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getDecryptedToken();

    if (!token) {
      clearToken();
      navigate("/login");
      return;
    }

    try {
        const decoded: DecodedToken = jwtDecode(token);

      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        clearToken();
        navigate("/login");
      }
    } catch (err) {
      console.error("Token invalid:", err);
      clearToken();
      navigate("/login");
    }
  }, [navigate]);
};

export default useAuthCheck;
