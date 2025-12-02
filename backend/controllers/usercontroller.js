import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import User from "../models/userModel.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * ============================================================
 * ✅ Multer Setup — Secure Uploads
 * ============================================================
 */
const allowedMimeTypes = ["image/jpeg", "image/png"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) =>
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`),
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only PNG and JPEG allowed"));
    }
    cb(null, true);
  },
});

/**
 * ============================================================
 * ✅ JWT Helper
 * ============================================================
 */
const createToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username,
      email: user.email,
      user_code: user.user_code,
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );

/**
 * ============================================================
 * ✅ REGISTER USER
 * ============================================================
 */
export const registerUser = async (req, res) => {
  try {
    let {
      username,
      email,
      password,
      firstName,
      lastName,
      gender,
      role = "STUDENT",
    } = req.body;

    email = email.toLowerCase().trim();
    username = username.trim();

    const exists = await User.findOne({ $or: [{ email }, { username }] });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    // ✅ Stronger role validation
    const elevatedRoles = ["ADMIN", "SUPER_ADMIN", "TEACHER"];
    role = role.toUpperCase();

    if (elevatedRoles.includes(role)) {
      if (!req.user || req.user.role !== "SUPER_ADMIN") {
        return res
          .status(403)
          .json({ message: "Only Super Admin can assign elevated roles" });
      }
    } else {
      role = "STUDENT";
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashed,
      firstName,
      lastName,
      gender,
      role,
    });

    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * ============================================================
 * ✅ LOGIN USER
 * ============================================================
 */
export const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");

    // 🚫 User not found
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    // 🚫 Soft-deleted users cannot login
    if (user.deleted) {
      return res.status(403).json({
        success: false,
        message: "This account was deleted. Please contact the administrator.",
      });
    }

    // 🚫 Blocked users cannot login
    if (user.blocked) {
      return res.status(403).json({
        success: false,
        message:
          "This account is blocked. Contact support or an administrator.",
      });
    }

    // 🔐 Password validation
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    // ✅ Create JWT token
    const token = createToken(user);

    if (!token) {
      return res
        .status(500)
        .json({ success: false, message: "Token generation failed." });
    }

    // ✅ Set secure, HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // ✅ Return clean JSON
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role?.toUpperCase() || "USER",
        user_code: user.user_code,
      },
    });
  } catch (e) {
    console.error("❌ Login error:", e);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
      error: e.message,
    });
  }
};


/**
 * ============================================================
 * ✅ LOGOUT
 * ============================================================
 */
export const logoutUser = (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (e) {
    res.status(500).json({ message: "Logout failed" });
  }
};

/**
 * ============================================================
 * ✅ GET ALL USERS
 * ============================================================
 */
export const getAllUsers = async (req, res) => {
  try {
    const list = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/**
 * ============================================================
 * ✅ GET USER BY ID
 * ============================================================
 */
export const getUserById = async (req, res) => {
  try {
    const u = await User.findById(req.params.userId).select("-password");
    if (!u) return res.status(404).json({ message: "User not found" });
    res.json(u);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/**
 * ============================================================
 * ✅ GET USER BY CODE
 * ============================================================
 */
export const getUserByCode = async (req, res) => {
  try {
    const u = await User.findOne({ user_code: req.params.code }).select(
      "-password"
    );
    if (!u) return res.status(404).json({ message: "User not found" });
    res.json(u);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/**
 * ============================================================
 * ✅ CHECK AUTH
 * ============================================================
 */
export const checkAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    });

    return res.status(200).json({
      user: {
        _id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      },
      token: req.token || null,
    });
  } catch (err) {
    console.error("checkAuth error:", err);
    res.status(500).json({ message: "Server error verifying auth" });
  }
};


/**
 * ============================================================
 * ✅ UPDATE PROFILE (Secure)
 * ============================================================
 */
export const updateUserProfile = async (req, res) => {
  try {
    const allowedFields = ["firstName", "lastName", "gender"];
    const updates = {};

    for (let key of allowedFields) {
      if (req.body[key]) updates[key] = req.body[key];
    }

    if (req.file) updates.profilePhoto = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.params.userId, updates, {
      new: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/**
 * ============================================================
 * ✅ UPDATE ROLE OR PASSWORD (Admin/Super Admin)
 * ============================================================
 */
export const updateUserRoleOrPassword = async (req, res) => {
  try {
    const { newRole, newPassword } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (newRole) {
      if (req.user.role !== "SUPER_ADMIN") {
        return res.status(403).json({
          message: "Only Super Admin can assign roles",
        });
      }
      user.role = newRole.toUpperCase();
    }

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({ success: true, message: "User updated successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateLoginMeta = async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: { lastLogin: new Date(), lastIP: ip },
        $push: {
          activityLog: { action: "Login", timestamp: new Date() },
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update login metadata",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Already deleted?
    if (user.deleted) {
      return res.status(400).json({
        success: false,
        message: "User is already soft-deleted",
      });
    }

    // Soft-delete
    user.deleted = true;
    user.deletedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: "User moved to recycle bin (soft deleted for 30 days)",
      deletedAt: user.deletedAt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to soft delete user",
      error: error.message,
    });
  }
};


export const restoreUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.deleted) {
      return res.status(400).json({ message: "User is not deleted" });
    }

    user.deleted = false;
    user.deletedAt = null;
    await user.save();

    res.json({ success: true, message: "User restored successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to restore user",
      error: error.message,
    });
  }
};
