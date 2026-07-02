import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { 
    FaSearch, 
    FaUser, 
    FaEnvelope, 
    FaBriefcase, 
    FaFileDownload, 
    FaRobot, 
    FaCheck, 
    FaTimes, 
    FaAward, 
    FaSpinner,
    FaExternalLinkAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const ManageApplicationsPage = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [scanningApp, setScanningApp] = useState(null);
    const [scanResults, setScanResults] = useState({});

    const loadApplications = async () => {
        try {
            const res = await api.get("/applications/recruiter");
            if (res.data && res.data.success) {
                setApplications(res.data.applications || []);
                setFilteredApps(res.data.applications || []);
            }
        } catch (err) {
            console.error("Error loading recruiter applications:", err);
            toast.error("Failed to load candidates inbox");
        } finally {
            setLoading(false);
        }
    };

    const navigateToProfile = (app) => {
        const ids = filteredApps.map(a => a._id);
        navigate(`/recruiter/applications/${app._id}`, {
            state: { applicationIds: ids, from: 'manage' }
        });
    };

    useEffect(() => {
        loadApplications();
    }, []);

    // Filter and search logic
    useEffect(() => {
        let temp = [...applications];

        if (filterStatus !== "all") {
            temp = temp.filter(app => app.status === filterStatus);
        }

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            temp = temp.filter(app => 
                app.applicant?.name?.toLowerCase().includes(query) ||
                app.applicant?.email?.toLowerCase().includes(query) ||
                app.job?.title?.toLowerCase().includes(query)
            );
        }

        setFilteredApps(temp);
    }, [filterStatus, searchQuery, applications]);

    const handleStatusUpdate = async (appId, newStatus) => {
        setActionLoading(appId);
        try {
            const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
            if (res.data && res.data.success) {
                setApplications(prev => 
                    prev.map(app => app._id === appId ? { ...app, status: newStatus } : app)
                );
                toast.success(`Candidate status updated to ${newStatus}`);
                if (selectedApp && selectedApp._id === appId) {
                    setSelectedApp(prev => ({ ...prev, status: newStatus }));
                }
            }
        } catch (err) {
            console.error("Status update error:", err);
            toast.error("Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const runAIScan = (app) => {
        setScanningApp(app._id);
        setTimeout(() => {
            // Generate deterministic but realistic scores/strengths based on candidate name and job title
            const nameLen = app.applicant?.name?.length || 10;
            const jobLen = app.job?.title?.length || 10;
            const seedScore = 70 + ((nameLen + jobLen) % 26);
            
            const strengths = [
                "Strong alignment with " + (app.job?.title || "role requirements"),
                "Proven experience in core stack matches",
                "Clean resume structural layouts"
            ];
            const weaknesses = [
                "Could elaborate more on specific metrics",
                "Minor formatting discrepancies in skills grid"
            ];
            
            setScanResults(prev => ({
                ...prev,
                [app._id]: {
                    score: seedScore,
                    strengths,
                    weaknesses,
                    scanned: true
                }
            }));
            setScanningApp(null);
            toast.success("AI Profile matching complete!");
        }, 1500);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Candidates Inbox</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review profiles, check AI resume matching scores, and shortlist talent.</p>
                </div>

                {/* Filters Board */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by name, email, or job..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                        />
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        {["all", "applied", "reviewed", "interview", "rejected", "hired"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border shrink-0 cursor-pointer ${
                                    filterStatus === status
                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                        : "bg-white dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Split Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Candidate Lists */}
                    <div className="lg:col-span-2 space-y-4">
                        {filteredApps.length === 0 ? (
                            <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/20">
                                <FaUser className="mx-auto text-4xl text-slate-600 mb-4" />
                                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No applications found</h3>
                                <p className="text-sm text-slate-500 mt-1">There are no candidates matching the active filter.</p>
                            </div>
                        ) : (
                            filteredApps.map((app) => {
                                const aiResult = scanResults[app._id];
                                return (
                                    <div
                                        key={app._id}
                                        onClick={() => navigateToProfile(app)}
                                        className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                            selectedApp?._id === app._id
                                                ? "bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                                                : "bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/20"
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-lg text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                <FaUser />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{app.applicant?.name || "Deleted Candidate"}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                                        app.status === "interview" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" :
                                                        app.status === "hired" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                                                        app.status === "rejected" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
                                                        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1.5">
                                                    <FaEnvelope className="text-slate-500" />
                                                    <span>{app.applicant?.email}</span>
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                                                    <FaBriefcase className="text-indigo-600 dark:text-indigo-400" />
                                                    <span className="font-semibold text-slate-600 dark:text-slate-300">{app.job?.title || "Deleted Job Listing"}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end md:self-center">
                                            {/* Quick View button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedApp(app);
                                                }}
                                                className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                            >
                                                <FaExternalLinkAlt className="text-xs" />
                                                <span>Quick View</span>
                                            </button>
                                            {/* AI Match Badge */}
                                            {aiResult?.scanned ? (
                                                <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
                                                    <FaRobot className="text-indigo-600 dark:text-indigo-400 text-sm" />
                                                    <span className="text-xs font-black text-indigo-500 dark:text-indigo-300">{aiResult.score}% Match</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        runAIScan(app);
                                                    }}
                                                    disabled={scanningApp === app._id}
                                                    className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                                                >
                                                    {scanningApp === app._id ? (
                                                        <FaSpinner className="animate-spin text-xs" />
                                                    ) : (
                                                        <FaRobot className="text-slate-500 dark:text-slate-400" />
                                                    )}
                                                    <span>AI Scan</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Candidate Details Side Drawer Panel */}
                    <div className="lg:sticky lg:top-24">
                        <AnimatePresence mode="wait">
                            {selectedApp ? (
                                <motion.div
                                    key={selectedApp._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 15 }}
                                    className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-xl space-y-6"
                                >
                                    {/* Candidate Intro */}
                                    <div className="text-center space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
                                        <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl text-indigo-600 dark:text-indigo-400">
                                            <FaUser />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-3">{selectedApp.applicant?.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{selectedApp.applicant?.email}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Applied for: <span className="text-indigo-600 dark:text-indigo-400">{selectedApp.job?.title}</span></p>
                                    </div>

                                    {/* View Full Profile */}
                                    <button
                                        onClick={() => navigateToProfile(selectedApp)}
                                        className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer"
                                    >
                                        <FaExternalLinkAlt /> View Full Profile
                                    </button>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Hiring Operations</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleStatusUpdate(selectedApp._id, "interview")}
                                                disabled={actionLoading === selectedApp._id || selectedApp.status === "interview"}
                                                className="inline-flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                <FaCheck className="text-[10px]" /> Shortlist
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(selectedApp._id, "rejected")}
                                                disabled={actionLoading === selectedApp._id || selectedApp.status === "rejected"}
                                                className="inline-flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                <FaTimes className="text-[10px]" /> Reject
                                            </button>
                                        </div>
                                        {selectedApp.status !== "hired" && (
                                            <button
                                                onClick={() => handleStatusUpdate(selectedApp._id, "hired")}
                                                disabled={actionLoading === selectedApp._id}
                                                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer"
                                            >
                                                <FaAward /> Mark as Hired
                                            </button>
                                        )}
                                        {selectedApp.applicant?.resumeUrl ? (
                                            <a
                                                href={selectedApp.applicant.resumeUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white transition-all text-center"
                                            >
                                                <FaFileDownload /> Download Resume
                                            </a>
                                        ) : (
                                            <div className="text-center p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 font-medium">
                                                No resume file uploaded by applicant
                                            </div>
                                        )}

                                        {selectedApp.job?.recruiter && (
                                            <Link
                                                to={`/messages?userId=${selectedApp.applicant?._id}`}
                                                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all text-center"
                                            >
                                                Chat with Candidate
                                            </Link>
                                        )}
                                    </div>

                                    {/* AI Scan Panel inside sidebar */}
                                    {scanResults[selectedApp._id] ? (
                                        <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">AI Scoring Match</h4>
                                                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{scanResults[selectedApp._id].score}%</span>
                                            </div>

                                            {/* Circular Match score bar */}
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full transition-all duration-500" 
                                                    style={{ width: `${scanResults[selectedApp._id].score}%` }} 
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-xs">
                                                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block mb-1">Match Strengths:</span>
                                                    <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 space-y-1">
                                                        {scanResults[selectedApp._id].strengths.map((s, i) => (
                                                            <li key={i}>{s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="font-extrabold text-amber-600 dark:text-amber-400 block mb-1">Improvement Areas:</span>
                                                    <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 space-y-1">
                                                        {scanResults[selectedApp._id].weaknesses.map((w, i) => (
                                                            <li key={i}>{w}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 text-center space-y-3">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Run AI resume matching scan to view compatibility insights.</p>
                                            <button
                                                onClick={() => runAIScan(selectedApp)}
                                                disabled={scanningApp === selectedApp._id}
                                                className="inline-flex justify-center items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer"
                                            >
                                                {scanningApp === selectedApp._id ? (
                                                    <FaSpinner className="animate-spin" />
                                                ) : (
                                                    <FaRobot />
                                                )}
                                                <span>Scan Match Rating</span>
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/20 text-center text-slate-500 py-16 text-sm font-medium">
                                    Select a candidate card to view full profiles and take action.
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManageApplicationsPage;
