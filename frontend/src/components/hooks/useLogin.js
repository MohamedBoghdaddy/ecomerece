// ✅ useLogin.js — Clean, Production-Ready Hook
import { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

// 🌍 Environment-aware API URL (matches AuthContext)
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : window.location.hostname.includes("preprod")
    ? "https://preprod-pregen.onrender.com"
    : "https://pregen.onrender.com";

// ⚙️ Shared Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const useLogin = () => {
  const navigate = useNavigate();
  const { login, dispatch } = useAuthContext();

  // 🧠 Local UI states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Main login handler
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        // 🧠 Call backend login API
        const response = await api.post("/api/users/login", {
          email,
          password,
        });

        // Expect JSON { user, token }
        const { user, token } = response.data || {};
        if (!user || !token)
          throw new Error("Unexpected server response format");

        // ✅ Save token + user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ user, token }));

        // ✅ Sync token to headers
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // ✅ Update AuthContext (safe background verification inside AuthContext)
        await login({ user, token });

        setSuccessMessage("Login successful ✅");
        navigate("/dashboard");
      } catch (error) {
        console.error("❌ Login error:", error);
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.message.includes("<!DOCTYPE")) {
          setErrorMessage(
            "Server returned HTML instead of JSON. Check API URL or proxy setup."
          );
        } else {
          setErrorMessage("Login failed. Please try again.");
        }
        dispatch({ type: "AUTH_ERROR" });
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, login, dispatch, navigate]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errorMessage,
    successMessage,
    isLoading,
    handleLogin,
  };
};
