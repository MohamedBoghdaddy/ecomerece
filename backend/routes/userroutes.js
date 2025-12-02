import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getUserById,
  getUserByCode,
  checkAuth,
  updateUserProfile,
  upload,
  updateLoginMeta,
  updateUserRoleOrPassword,
  deleteUser,
  restoreUser, // ✅ add this
} from "../controllers/usercontroller.js";

import {
  auth,
} from "../middleware/authMiddleware.js";

import User from "../models/userModel.js";

const router = express.Router();

/**
 * 🟢 PUBLIC ROUTES (no auth required)
 */
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

/**
 * 🟡 AUTH PROTECTED ROUTES
 */
router.get("/checkAuth", auth, checkAuth);

/**
 * 👤 User Self Profile
 */
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

router.put(
  "/profile/:userId",
  auth,
  upload.single("profilePhoto"),
  updateUserProfile
);

/**
 * 🔍 GET USER BY ID / USER_CODE
 */
router.get(
  "/users/id/:userId",
  auth,
  // authorizeRoles("admin", "super_admin"),
  getUserById
);

router.get(
  "/users/code/:code",
  auth,
  // authorizeRoles("admin", "super_admin"),
  getUserByCode
);

/**
 * 🔐 ADMIN + SUPER_ADMIN ROUTES
 * Only elevated roles can see users list
 */
router.get("/users",
   auth,
    // authorizeRoles("admin", "super_admin"),
    getAllUsers);



/**
 * 📌 LOGIN META UPDATE ROUTE
 * Called after login only
 */
router.put("/meta/login", updateLoginMeta);

/**
 * 🏫 ADMINISTRATIVE ROUTES
 */
router.put(
  "/admin/update-user/:id",
  auth,
  // authorizeRoles("super_admin", "admin"),
  updateUserRoleOrPassword
);

/**
 * 🔥 SUPER_ADMIN ONLY
 */
// router.put(
//   "/admin/update-role/:id",
//   auth,
//   verifySuperAdmin,
//   updateUserRoleOrPassword
// );

/**
 * 🧱 DASHBOARD ROUTE
 */
// router.get(
//   "/dashboard",
//   auth,
//   authorizeRoles("super_admin", "admin", "teacher", "student"),
//   (req, res) => {
//     res.json({ message: `Welcome ${req.user.role} to your dashboard!` });
//   }
// );

/**
 * 🧩 SYSTEM MANAGEMENT ROUTES (Super Admin only)
 */
// router.get("/all", auth, verifySuperAdmin, async (req, res) => {
//   try {
//     const users = await User.find().sort({ createdAt: -1 });
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching users" });
//   }
// });

// router.delete("/delete/:id", auth, verifySuperAdmin, deleteUser);

// router.put(
//   "/restore/:id",
//   auth,
//   authorizeRoles("super_admin", "admin"),
//   restoreUser
// );
/**
 * 🚫 TOGGLE BLOCK STATUS
 */
// router.put(
//   "/toggle-block/:id",
//   auth,
//   authorizeRoles("admin", "super_admin"),
//   async (req, res) => {
//     try {
//       const user = await User.findById(req.params.id);
//       if (!user) return res.status(404).json({ message: "User not found" });

//       user.blocked = !user.blocked;
//       await user.save();

//       res.json({ success: true, blocked: user.blocked });
//     } catch (err) {
//       res.status(500).json({ message: "Error toggling block status" });
//     }
//   }
// );

/**
 * 🧪 ROLE TEST ROUTES
 */
// router.get("/super-admin", auth, verifySuperAdmin, (req, res) => {
//   res.json({ message: "Welcome, Super Admin!" });
// });

// router.get("/admin", auth, verifyAdmin, (req, res) => {
//   res.json({ message: "Welcome, Admin!" });
// });

// router.get("/teacher", auth, verifyTeacher, (req, res) => {
//   res.json({ message: "Welcome, Teacher!" });
// });

// router.get("/student", auth, verifyStudent, (req, res) => {
//   res.json({ message: "Welcome, Student!" });
// });

export default router;
