import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const total = await Task.countDocuments({ assignedTo: userId });

  const statusStats = await Task.aggregate([
    { $match: { assignedTo: userId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const overdue = await Task.countDocuments({
    assignedTo: userId,
    dueDate: { $lt: new Date() },
    status: { $ne: "done" },
  });

  return successResponse(res, {
    totalTasks: total,
    overdueTasks: overdue,
    status: statusStats,
  });
});
