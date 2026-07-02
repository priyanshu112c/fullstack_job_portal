import mongoose from "mongoose";

const applicationSchema =
  new mongoose.Schema(
    {
      applicant: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true
      },

      job: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Job",
        required: true
      },

      status: {
        type: String,
        enum: [
          "applied",
          "reviewed",
          "interview",
          "rejected",
          "hired"
        ],
        default: "applied"
      },

      resumeUrl: {
        type: String,
        default: ""
      }
    },
    {
      timestamps: true
    }
  );
  applicationSchema.index(
  {
    applicant: 1,
    job: 1
  },
  {
    unique: true
  }
);

export default mongoose.model(
  "Application",
  applicationSchema
);