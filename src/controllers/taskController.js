import mongoose from "mongoose";
import Task from "../models/Task.js";
import Project from "../models/Project.js";

export const createTask = async (req, res) => {
  try {
    const { title, projectId, assignedTo } = req.body;

    if (!title || !projectId || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(projectId) ||
      !mongoose.Types.ObjectId.isValid(assignedTo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid IDs",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only admin can create tasks",
      });
    }

    const isMember = project.members.some((m) => m.toString() === assignedTo);

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "User is not part of this project",
      });
    }

    const task = await Task.create({
      title,
      project: projectId,
      assignedTo,
      status: "todo",
    });

    const populatedTask = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignedTo", "name email");

    return res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================
// 📦 GET TASKS (ROLE BASED)
// ==========================
export const getTasks = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "member") {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    console.error("Get tasks error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================
// 🔄 UPDATE TASK (🔥 FINAL)
// ==========================
export const updateTask = async (req, res) => {
  try {
    const { status, title, assignedTo } = req.body;
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ================= MEMBER =================
    if (req.user.role === "member") {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized",
        });
      }

      const allowedStatus = ["todo", "in-progress", "done"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      task.status = status;
    }

    // ================= ADMIN =================
    if (req.user.role === "admin") {
      // 🔥 update title
      if (title) {
        task.title = title;
      }

      // 🔥 update status
      if (status) {
        const allowedStatus = ["todo", "in-progress", "done"];
        if (!allowedStatus.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid status",
          });
        }
        task.status = status;
      }

      // 🔥 update assigned user
      if (assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        // check project membership
        const project = await Project.findById(task.project);

        const isMember = project.members.some(
          (m) => m.toString() === assignedTo,
        );

        if (!isMember) {
          return res.status(400).json({
            success: false,
            message: "User not part of project",
          });
        }

        task.assignedTo = assignedTo;
      }
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignedTo", "name email");

    return res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================
// 🗑️ DELETE TASK
// ==========================
export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete tasks",
      });
    }

    await task.deleteOne();

    return res.json({
      success: true,
      message: "Task deleted",
    });
  } catch (error) {
    console.error("Delete task error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
