import "../../Styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useLogin } from "../../hooks/useLogin";
import { useAuthContext } from "../../context/AuthContext";
import ShowPass from "../../../Assets/Images/eye.svg";
import ShowPassOff from "../../../Assets/Images/eye-off.svg";


const Login = ({ onLoginSuccess }) => {
  const {
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
  } = useLogin();

  const { isAuthenticated, user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const hasRedirected = useRef(false); // ✅ Prevents redirect loop

  /* ======================================================
     ✅ Auto Redirect if Authenticated (StrictMode Safe)
  ====================================================== */
  useEffect(() => {
    // Don't redirect if still loading or already redirected
    if (authLoading || hasRedirected.current) return;

    if (isAuthenticated && user) {
      hasRedirected.current = true; // 🔒 prevent double redirect
      navigate("/dashboard", { replace: true });

      if (onLoginSuccess) onLoginSuccess(); // ✅ close modal safely
    }
  }, [isAuthenticated, user, authLoading, navigate, onLoginSuccess]);

  /* ======================================================
     ✅ Handle Form Submission (No Double PreventDefault)
  ====================================================== */
  const handleSubmit = async (e) => {
    await handleLogin(e);
    // ✅ trigger modal close only after successful login
    if (onLoginSuccess && !errorMessage) onLoginSuccess();
  };

  /* ======================================================
     ✅ UI
  ====================================================== */
  return (
    <div className="login-modal-overlay">
      <div className="login-modal-container css-scale-in">
        <div className="login-container">
          {/* Left Side */}
          <div className="left-login">
            <h2>Welcome Back 👋</h2>
            <p>Sign in to continue your AI-powered learning journey.</p>
          </div>

          {/* Right Side */}
          <div className="right-login">
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="show-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                  >
                    <img
                      src={showPassword ? ShowPassOff : ShowPass}
                      alt="toggle password"
                    />
                  </button>
                </div>
              </div>

              {/* Messages */}
              {errorMessage && <div className="error">{errorMessage}</div>}
              {successMessage && (
                <div className="success">{successMessage}</div>
              )}

              {/* Buttons */}
              <button
                className="auth-btn login"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="reg_cta">
              Don’t have an account?{" "}
              <Link to="/signup" className="reg_link">
                <button className="auth-btn signup">Signup</button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
