// ✅ AuthContext.js — Final, Loop-Proof, StrictMode-Safe
import {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";

// 🌍 Environment-based backend URL
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : window.location.hostname.includes("preprod")
    ? "https://preprod-pregen.onrender.com"
    : "https://pregen.onrender.com";

// ⚙️ Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// 🧩 Global guard (ensures one auth check at a time)
let isAuthChecking = false;

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "USER_LOADED":
      return {
        ...state,
        user: action.payload.user || action.payload,
        token: action.payload.token || state.token,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT_SUCCESS":
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};

// Helpers
const getToken = () => {
  try {
    return (
      Cookies.get("token") ||
      localStorage.getItem("token") ||
      JSON.parse(localStorage.getItem("user") || "null")?.token
    );
  } catch {
    return null;
  }
};

const setAuthHeaders = (token) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};

const clearAuthStorage = () => {
  Cookies.remove("token");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  delete api.defaults.headers.common["Authorization"];
};

// Context
const AuthContext = createContext();

// ✅ Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const hasInitialized = useRef(false); // StrictMode guard
  const pendingLoginRef = useRef(false); // Prevent race condition with checkAuth

  // ✅ Verify auth with backend (single guarded request)
  const checkAuth = useCallback(async () => {
    if (isAuthChecking || pendingLoginRef.current) return;
    isAuthChecking = true;

    try {
      const token = getToken();
      if (!token) {
        dispatch({ type: "AUTH_ERROR" });
        return;
      }

      setAuthHeaders(token);

      const res = await api.get("/api/users/checkAuth", {
        headers: { "Cache-Control": "no-store" },
      });

      if (res.data?.user) {
        const normalizedUser = {
          ...res.data.user,
          role: res.data.user.role?.toUpperCase?.() || "USER",
        };
        const payload = { user: normalizedUser, token };

        localStorage.setItem("user", JSON.stringify(payload));
        Cookies.set("token", token, { expires: 7 });

        dispatch({ type: "USER_LOADED", payload });
      } else {
        dispatch({ type: "AUTH_ERROR" });
      }
    } catch (err) {
      console.error("❌ Auth check failed:", err.message);
      clearAuthStorage();
      dispatch({ type: "AUTH_ERROR" });
    } finally {
      isAuthChecking = false;
    }
  }, []);

  // ✅ Login (ensures backend verification only after persistence)
  const login = useCallback(
    async (userData) => {
      try {
        if (!userData?.token) throw new Error("Missing token");
        const normalizedUser = {
          ...userData.user,
          role: userData.user.role?.toUpperCase?.() || "USER",
        };
        const payload = { user: normalizedUser, token: userData.token };

        // Persist first
        localStorage.setItem("user", JSON.stringify(payload));
        Cookies.set("token", userData.token, { expires: 7 });
        setAuthHeaders(userData.token);

        dispatch({ type: "LOGIN_SUCCESS", payload });

        // Delay background verification slightly to avoid overlap
        pendingLoginRef.current = true;
        setTimeout(async () => {
          await checkAuth();
          pendingLoginRef.current = false;
        }, 800);
      } catch (err) {
        console.error("❌ Login failed:", err);
        clearAuthStorage();
        dispatch({ type: "AUTH_ERROR" });
      }
    },
    [checkAuth]
  );

  // ✅ Logout
  const logout = useCallback(async () => {
    try {
      await api.post("/api/users/logout").catch(() => {});
    } finally {
      clearAuthStorage();
      dispatch({ type: "LOGOUT_SUCCESS" });
    }
  }, []);

  // ✅ Initialize (strict mode & double mount safe)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      const stored = localStorage.getItem("user");
      const token = getToken();

      if (stored && token) {
        try {
          const parsed = JSON.parse(stored);
          const normalizedUser = {
            ...parsed.user,
            role: parsed.user.role?.toUpperCase?.() || "USER",
          };
          setAuthHeaders(token);
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user: normalizedUser, token },
          });
        } catch {
          clearAuthStorage();
        }
      }

      // Wait briefly before checking auth (prevents login/checkAuth collision)
      setTimeout(() => checkAuth(), 300);
    };

    init();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        checkAuth,
        dispatch,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook
export const useAuthContext = () => useContext(AuthContext);
