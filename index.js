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

// 🔐 Security middleware
app.use(helmet());

// 🌐 CORS
app.use(cors());

// 📦 Body parser
app.use(express.json());

// 🚫 Rate limiting (protect from abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // limit each IP
});
app.use(limiter);

// 🧪 Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 🗄️ DB connection
connectDB();

// 📌 Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ❌ 404 handler (important)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ⚠️ Global error handler
app.use(errorHandler);

// 🚀 Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});