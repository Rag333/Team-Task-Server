import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
      index: true
    },
    dueDate: {
      type: Date
    }
  },
  { timestamps: true }
);

// compound index (important for performance)
taskSchema.index({ project: 1, assignedTo: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;