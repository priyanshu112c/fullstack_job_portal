import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaFilePdf, FaRobot, FaSpinner, FaChartLine, FaCheck, FaExclamationTriangle, FaLightbulb } from "react-icons/fa";
import toast from "react-hot-toast";

const ResumeAnalyzerPage = () => {
    const [user, setUser] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    const loadData = async () => {
        try {
            const userRes = await api.get("/users/me");
            setUser(userRes.data.user);

            const analysisRes = await api.get("/ai/resume-analysis");
            if (analysisRes.data?.analysis) {
                setAnalysis(analysisRes.data.analysis);
            }
        } catch (err) {
            console.error("Error loading resume analyzer:", err);
            toast.error("Failed to load user details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const triggerAnalysis = async () => {
        setAnalyzing(true);
        try {
            // Debug: verify auth token presence before calling protected endpoint
            console.log("[ResumeAnalyzerPage] access token present:", !!api?.defaults?.headers?.Authorization);
            const res = await api.post("/ai/resume-analysis");
            if (res.data && res.data.success) {
                setAnalysis(res.data.analysis);
                toast.success("AI Resume Analysis completed successfully!");
            }
        } catch (err) {
            console.error("Error analyzing resume:", err);
            toast.error(err.response?.data?.message || "AI Analysis failed. Make sure OpenRouter key is set.");
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-2xl text-indigo-600 dark:text-indigo-400">
                        <FaRobot />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Resume Analyzer</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Obtain immediate feedback, score parameters, and improvement tips.</p>
                    </div>
                </div>

                {!user?.resumeUrl ? (
                    <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 backdrop-blur-xl">
                        <FaFilePdf className="mx-auto text-5xl text-slate-600 dark:text-slate-400 mb-4" />
                        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">No Resume Uploaded</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                            You must upload your resume in PDF format on your profile details page before triggering the AI analyzer.
                        </p>
                        <Link to="/profile" className="mt-6 inline-flex justify-center text-sm font-semibold px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white shadow-lg transition-all">
                            Go to Profile
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Summary / Analyze box */}
                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <FaFilePdf className="text-rose-500 text-4xl flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold">Active document: Resume.pdf</h3>
                                    <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View original file</a>
                                </div>
                            </div>
                            <button
                                onClick={triggerAnalysis}
                                disabled={analyzing}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60"
                            >
                                {analyzing ? (
                                    <>
                                        <FaSpinner className="animate-spin text-sm" />
                                        <span>Analyzing PDF with GPT...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaRobot />
                                        <span>Analyze Resume</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Analysis results */}
                        {analysis && (
                            <div className="grid md:grid-cols-3 gap-8">
                                {/* Score card */}
                                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Overall Score</span>
                                    <div className="relative flex items-center justify-center">
                                        {/* Simple circular percentage visual */}
                                        <div className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center">
                                            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">{analysis.score}%</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                                        Your resume score indicates structural and keyword matches based on platform algorithms.
                                    </p>
                                </div>

                                {/* Strengths and Weaknesses */}
                                <div className="md:col-span-2 space-y-6">
                                    {/* Strengths */}
                                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl space-y-3">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <FaCheck className="text-emerald-500" />
                                            <span>Key Strengths</span>
                                        </h3>
                                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                            {analysis.strengths?.map((str, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-indigo-600 dark:text-indigo-400 mt-1">&bull;</span>
                                                    <span>{str}</span>
                                                </li>
                                            ))}
                                            {(!analysis.strengths || analysis.strengths.length === 0) && (
                                                <li className="text-slate-500 italic">No metrics evaluated</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Weaknesses */}
                                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl space-y-3">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <FaExclamationTriangle className="text-amber-500" />
                                            <span>Missing Areas</span>
                                        </h3>
                                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                            {analysis.weaknesses?.map((weak, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-indigo-600 dark:text-indigo-400 mt-1">&bull;</span>
                                                    <span>{weak}</span>
                                                </li>
                                            ))}
                                            {(!analysis.weaknesses || analysis.weaknesses.length === 0) && (
                                                <li className="text-slate-500 italic">No missing areas detected</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl space-y-3">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <FaLightbulb className="text-indigo-600 dark:text-indigo-400" />
                                            <span>Improvement Tips</span>
                                        </h3>
                                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                            {analysis.suggestions?.map((sug, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-indigo-600 dark:text-indigo-400 mt-1">&bull;</span>
                                                    <span>{sug}</span>
                                                </li>
                                            ))}
                                            {(!analysis.suggestions || analysis.suggestions.length === 0) && (
                                                <li className="text-slate-500 italic">No suggestions provided</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ResumeAnalyzerPage;
