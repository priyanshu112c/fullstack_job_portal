import User from '../models/User.js'
import ResumeAnalysis from "../models/ResumeAnalysis.js"
import extractTextFromPdf from '../utils/pdfTextExtractor.js'
import { analyzeResumeWithAI } from '../services/ai.service.js'

function parseAIJson(content) {
    if (!content || typeof content !== "string") return null;

    // Remove markdown code fences if present
    const cleaned = content
        .replace(/```json\s*/gi, "```")
        .replace(/```/g, "")
        .trim();

    // Try direct JSON parse first
    try {
        return JSON.parse(cleaned);
    } catch (_) {
        // Fallback: extract the first {...} block
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match) return null;

        try {
            return JSON.parse(match[0]);
        } catch (__) {
            return null;
        }
    }
}

export const getLatestAnalysis = async (req, res, next) => {
    try {
        const analysis = await ResumeAnalysis.findOne({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            analysis
        })
    } catch (error) {
        next(error)
    }
}

export const analyzeResume = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user.resumeUrl) {
            return res.status(400).json({
                success: false,
                message: "No resume uploaded"
            })
        }

        const resumeText = await extractTextFromPdf(user.resumeUrl)
        const result = await analyzeResumeWithAI(resumeText)

        const parsed = parseAIJson(result);
        if (!parsed) {
            return res.status(500).json({
                success: false,
                message: "AI returned an invalid JSON response"
            })
        }

        const analysis = await ResumeAnalysis.create({
            user: req.user.id,
            score: parsed.score,
            strengths: parsed.strengths,
            weaknesses: parsed.weaknesses,
            suggestions: parsed.suggestions
        })

        res.status(200).json({
            success: true,
            analysis
        })
    } catch (error) {
        next(error)
    }
}
