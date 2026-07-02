import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    grade: { type: String, default: "" },
    description: { type: String, default: "" },
}, { _id: true });

const workExperienceSchema = new mongoose.Schema({
    company: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, default: "" },
}, { _id: true });

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    technologies: [{ type: String }],
    url: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
}, { _id: true });

const certificationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    issuer: { type: String, default: "" },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    url: { type: String, default: "" },
}, { _id: true });

const jobSeekerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    personalDetails: {
        phone: { type: String, default: "" },
        bio: { type: String, default: "" },
        location: { type: String, default: "" },
        dateOfBirth: { type: Date, default: null },
        linkedIn: { type: String, default: "" },
        github: { type: String, default: "" },
        website: { type: String, default: "" },
    },
    education: [educationSchema],
    workExperience: [workExperienceSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    skills: [{ type: String }],
    resumeUrl: { type: String, default: "" },
    resumePublicId: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("JobSeekerProfile", jobSeekerProfileSchema);
