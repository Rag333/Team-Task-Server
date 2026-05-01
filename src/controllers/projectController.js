import Project from "../models/Project.js";
import User from "../models/User.js";
import Task from "../models/Task.js";

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // only admin
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    project.name = name || project.name;
    project.description = description || project.description;

    await project.save();

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const addMember = async (req, res) => {
  try {
    const { projectId, userId } = req.body;

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
        message: "Only project admin can add members",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (project.members.some((m) => m.toString() === userId)) {
      return res.status(400).json({
        success: false,
        message: "User already added",
      });
    }

    project.members.push(userId);
    await project.save();

    const updated = await Project.findById(project._id).populate(
      "members",
      "name email role",
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    })
      .populate("admin", "name email")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAssignableMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate(
      "members",
      "name email",
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const users = project.members.filter(
      (m) => m._id.toString() !== project.admin.toString(),
    );

    res.json({
      success: true,
      data: users,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Task.deleteMany({ project: id });
    await project.deleteOne();

    res.json({
      success: true,
      message: "Project deleted",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
