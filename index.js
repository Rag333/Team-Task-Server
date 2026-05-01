import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./src/config/db.js";

// routes
import authRoutes from "./src/routes/authRoutes.js";
import testRoutes from "./src/routes/testRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";

// error handler
import { errorHandler } from "./src/middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// 🔐 Security
app.use(helmet());

// 🔥 IMPORTANT (for deployment)
app.set("trust proxy", 1);

// 🌐 CORS (FIXED)
app.use(
  cors({
    origin: ["http://localhost:5173", "https://team-task-client.vercel.app/"],
    credentials: true,
  }),
);

// 📦 Body parser
app.use(express.json());

// 🚫 Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// 🧪 Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Backend working fine" });
});

// 🗄️ DB
connectDB();

// 📌 Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ❌ 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ⚠️ Error handler
app.use(errorHandler);

// 🚀 Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
