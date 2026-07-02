import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    companyLogo: {
      type: String,
      default: null
    },
    companyLogoPublicId: {
      type: String,
      default: null
    },
    websiteUrl: {
      type: String,
      default: null
    },
    socialLinks: {
      type: String,
      default: null
    },
    gstNumber: {
      type: String,
      default: null
    },
    uinNumber: {
      type: String,
      default: null
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Company", companySchema);
