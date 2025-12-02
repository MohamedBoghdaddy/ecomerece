import mongoose from "mongoose";
// import { generateUserCode } from "../utils/generateUserCode.js";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "teacher", "student"],
      default: "student",
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      default: null,
    },

    blocked: { type: Boolean, default: false },
    receiveNotifications: { type: Boolean, default: true },
    profilePhoto: { type: String, default: "" },
    lastLogin: { type: Date, default: null },
    lastIP: { type: String, default: "" },

    activityLog: [
      {
        action: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    // ✅ Unified role-based ID
    // user_code: {
    //   type: String,
    //   unique: true,
    //   sparse: true,
    // },
  },
  { timestamps: true }
);

// ✅ Normalize username before saving
UserSchema.pre("save", function (next) {
  if (this.username) {
    this.username = this.username.trim().toLowerCase();
  }
  next();
});

// ✅ Auto-generate role-based ID (STU_... TEA_... ADM_... SUP_...)
// UserSchema.pre("save", async function (next) {
//   if (this.isNew && !this.user_code) {
//     this.user_code = await generateUserCode(this.role);
//   }
//   next();
// });

const User = mongoose.model("User", UserSchema);
export default User;
