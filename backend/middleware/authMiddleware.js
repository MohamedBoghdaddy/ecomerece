// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secure_dev_token";

/**
 * ✅ Authentication Middleware
 * Supports Bearer token or cookie-based JWT
 * Attaches verified `user` to `req`
 */
export const auth = async (req, res, next) => {
  try {
    // Extract token
    const token =
      req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // Find user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user info to request
    req.user = user;
    req.token = token;

    console.log(
      `✅ Authenticated: ${user.email} (${user.role}) (${user.username})`
    );
    next();
  } catch (err) {
    console.error("❌ Authentication error:", err.message);

    const message =
      err.name === "TokenExpiredError"
        ? "Session expired. Please login again."
        : "Invalid or missing authentication token.";

    return res.status(401).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" && { error: err.message }),
    });
  }
};

/**
 * ✅ Role-based Authorization Middleware
 * Example usage:
 *    router.post("/school", auth, authorizeRoles("super_admin", "admin"));
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(
        `🚫 Access denied for user ${req.user._id} (${
          req.user.role
        }), required: ${roles.join(", ")}`
      );
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
        yourRole: req.user.role,
      });
    }

    console.log(`✅ Role authorized: ${req.user.role}`);
    next();
  };
};

// ============================================================
// ✅ Role-based Shortcuts for Readability
// ============================================================

// 🧠 Top-level access
export const verifySuperAdmin = authorizeRoles("super_admin");

// 👑 Administrative roles
export const verifyAdmin = authorizeRoles("admin", "super_admin");
export const verifyAdminOrEmployee = authorizeRoles("admin", "employee");

// 👨‍🏫 Teaching staff
export const verifyTeacher = authorizeRoles("teacher", "admin", "super_admin");

// 🎓 Students and general users
export const verifyStudent = authorizeRoles(
  "student",
  "teacher",
  "admin",
  "super_admin"
);

// 💼 Clients or external users
export const verifyClient = authorizeRoles("client");

// ------------------------------------------------------------
// ✅ Explicit Admin-only Middleware (for critical routes)
// ------------------------------------------------------------
export const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res
      .status(403)
      .json({ success: false, message: "Access denied. Admins only." });
  }
  return next();
};
