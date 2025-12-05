// 📦 Core Imports
import dotenv from "dotenv";
dotenv.config(); // ✅ Load environment variables before anything else

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import axios from "axios";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// 🌍 Route Imports
import userRoutes from "./routes/userroutes.js";
import profuctRoutes from"./routes/productRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
// 📁 Path Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔐 Configuration
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const MONGO_URI = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/pregen";
const JWT_SECRET = process.env.JWT_SECRET || "secure_dev_token";
const NODE_ENV = process.env.NODE_ENV || "development";

// 🧠 Verify Config
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not defined. Check your .env file.");
  process.exit(1);
}

// 🍃 MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully.");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// 🚀 Express App Init
const app = express();
await connectDB();

// 🧠 Session Store
const MongoDBStore = connectMongoDBSession(session);
const store = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});
store.on("error", (err) => console.error("❌ Session store error:", err));

// 🛡️ Security Middleware
app.use(helmet());
app.use(morgan("dev"));

// ✅ CORS Configuration
// ✅ Enhanced CORS Configuration (Fix for Cache-Control + Preflight)
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://preprod-pregen.netlify.app",
  "https://pregen.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked origin: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control", // ✅ added for frontend cache-busting
      "Pragma", // ✅ added for compatibility
      "Expires", // ✅ added for compatibility
      "x-request-id",
      "Accept",
      "X-Requested-With",
    ],
    exposedHeaders: ["Content-Disposition", "Content-Type"],
  })
);

// ✅ Handle Preflight for All Routes
app.options("*", cors());

// 🔐 Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(apiLimiter);

// 📂 Ensure Upload Folder Exists
fs.mkdirSync("uploads", { recursive: true });

// 📦 Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// 🧩 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "None",
    },
  })
);

// 🧩 API Routes (Only those that exist in your backend)
app.use("/api/users", userRoutes);
app.use("/products", profuctRoutes)
app.use("/favorite", favoriteRoutes)

// ⚛️ Root Health Check
app.get("/", (req, res) => {
  res.send("✅ E-Learning Backend API is live and connected successfully!");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    environment: NODE_ENV,
    client: CLIENT_URL,
  });
});

// 🚨 Error Handling
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: NODE_ENV === "development" ? err.message : undefined,
  });
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`
  🚀 web project Backend Running!
  🌍 Port: ${PORT}
  🌐 Client: ${CLIENT_URL}
  📦 MongoDB: ${MONGO_URI}
  🧭 Environment: ${NODE_ENV}
  `);
});
