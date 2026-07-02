import mongoose from "mongoose"

const resumeAnalysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    score: Number,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String]
}, {
    timestamps: true
})

export default mongoose.model("ResumeAnalysis", resumeAnalysisSchema)