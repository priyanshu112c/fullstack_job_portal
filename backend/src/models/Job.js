import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    company: {
      type: String,
      required: true
    },

    companyLogo: {
      type: String,
      default: null
    },

    location: {
      type: String,
      required: true
    },

    salaryMin: Number,

    salaryMax: Number,

    employmentType: {
      type: String,
      enum: [
        "full-time",
        "part-time",
        "contract",
        "internship"
      ]
    },

    skills: [String],

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
jobSchema.index({
  title: 1,
  location: 1,
  employmentType: 1
})
export default mongoose.model(
  "Job",
  jobSchema
);