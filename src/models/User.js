import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true // helps lookup at scale
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false // don’t return by default
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
      index: true
    }
  },
  { timestamps: true }
);

// Optional compound index (future queries)
userSchema.index({ email: 1, role: 1 });

const User = mongoose.model("User", userSchema);

export default User;