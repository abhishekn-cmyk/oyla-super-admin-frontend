// hooks/useLogin.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginSuperAdmin } from "../api/auth";


export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError("");

    try {
      const data = await loginSuperAdmin(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("superadmin", JSON.stringify(data.superadmin));

      toast.success("Login successful!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      setError(err.message || "Server error");
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
