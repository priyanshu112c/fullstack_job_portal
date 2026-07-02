import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    resumeUrl: {
      type: String,
      default: null,
    },
    resumePublicId: {
      type: String,
      default: null,
    },
role: {
      type: String,
      enum: ["admin", "recruiter", "job_seeker"],
      default: "job_seeker",
    },
    // Existing blocking mechanism (kept unchanged for backwards compatibility)
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    // Non-breaking addition: boolean mirror used by new admin features
    // Admin actions will set this, while existing logic can still rely on `status`.
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // Block metadata for admin tracking
    blockedAt: {
      type: Date,
      default: null,
    },
    blockedReason: {
      type: String,
      default: null,
    },
    blockedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
