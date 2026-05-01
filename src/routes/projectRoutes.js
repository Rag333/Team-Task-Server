import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  createProject,
  addMember,
  getProjects,
  getAssignableMembers,
  deleteProject,
  updateProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), createProject);

router.put("/:id", protect, authorize("admin"), updateProject);

router.post("/add-member", protect, authorize("admin"), addMember);

router.get("/", protect, getProjects);

router.get(
  "/:projectId/members",
  protect,
  authorize("admin"),
  getAssignableMembers,
);

router.delete("/:id", protect, authorize("admin"), deleteProject);

export default router;
