import openrouter from "../config/openrouter.js";

export const analyzeResumeWithAI = async (resumeText) => {
    if (!resumeText) {
        throw new Error("Resume text is empty");
    }

    const prompt = `
Analyze this resume.

Return:

{
  "score": 0-100,
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Resume:

${resumeText}
`;

    const completion = await openrouter.chat.completions.create({
        model: process.env.AI_MODEL,
        messages: [{ role: "user", content: prompt }]
    });

    return completion?.choices?.[0]?.message?.content;
};
