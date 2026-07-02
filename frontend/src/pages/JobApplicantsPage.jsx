import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaArrowLeft, FaUser, FaEnvelope, FaFileDownload, FaSpinner, FaCheck, FaTimes, FaAward, FaBriefcase, FaMapMarkerAlt, FaExternalLinkAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const statusStyles = {
    applied: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    reviewed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    interview: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    hired: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const JobApplicantsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [jobRes, appsRes] = await Promise.all([
                    api.get(`/jobs/${id}`),
                    api.get("/applications/recruiter"),
                ]);

                if (jobRes.data?.success) {
                    setJob(jobRes.data.job);
                }

                if (appsRes.data?.success) {
                    const filtered = (appsRes.data.applications || []).filter(
                        (app) => app.job?._id === id
                    );
                    setApplicants(filtered);
                }
            } catch (err) {
                console.error("Error loading job applicants:", err);
                toast.error("Failed to load applicants");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const navigateToProfile = (app) => {
        const ids = applicants.map(a => a._id);
        navigate(`/recruiter/applications/${app._id}`, {
            state: { applicationIds: ids, jobId: id, from: 'job' }
        });
    };

    const handleStatusUpdate = async (appId, newStatus) => {
        setActionLoading(appId);
        try {
            const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
            if (res.data?.success) {
                setApplicants((prev) =>
                    prev.map((app) =>
                        app._id === appId ? { ...app, status: newStatus } : app
                    )
                );
                toast.success(`Status updated to ${newStatus}`);
            }
        } catch (err) {
            console.error("Status update error:", err);
            toast.error("Failed to update status");
        } finally {
            setActionLoading(null);
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

    if (!job) {
        return (
            <DashboardLayout>
                <div className="text-center py-16">
                    <p className="text-slate-500 dark:text-slate-400">Job not found.</p>
                    <Link to="/recruiter/jobs" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">Back to Manage Jobs</Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Link to="/recruiter/jobs" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1"><FaBriefcase className="text-indigo-600 dark:text-indigo-400" /> {job.company}</span>
                            <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-indigo-600 dark:text-indigo-400" /> {job.location}</span>
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Applicants ({applicants.length})</h2>
                    </div>

                    {applicants.length === 0 ? (
                        <div className="text-center py-16">
                            <FaUser className="mx-auto text-4xl text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No applicants yet</h3>
                            <p className="text-sm text-slate-500 mt-1">Candidates who apply for this position will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                                        <th className="py-3 px-4">Applicant</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Resume</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applicants.map((app) => (
                                        <tr key={app._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-800 dark:text-white">
                                                <button
                                                    onClick={() => navigateToProfile(app)}
                                                    className="flex items-center gap-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
                                                >
                                                    <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                                                        <FaUser />
                                                    </div>
                                                    {app.applicant?.name || "Deleted User"}
                                                </button>
                                            </td>
                                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <FaEnvelope className="text-slate-500 dark:text-slate-400" /> {app.applicant?.email || "N/A"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusStyles[app.status] || statusStyles.applied}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                {app.applicant?.resumeUrl ? (
                                                    <a href={app.applicant.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300">
                                                        <FaFileDownload /> Resume
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-500">N/A</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-right space-x-2">
                                                <button
                                                    onClick={() => navigateToProfile(app)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                                                >
                                                    <FaExternalLinkAlt /> Profile
                                                </button>
                                                {["interview", "hired"].includes(app.status) ? null : (
                                                    <button
                                                        onClick={() => handleStatusUpdate(app._id, "interview")}
                                                        disabled={actionLoading === app._id}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer disabled:opacity-50"
                                                    >
                                                        {actionLoading === app._id ? <FaSpinner className="animate-spin" /> : <FaCheck />} Shortlist
                                                    </button>
                                                )}
                                                {app.status !== "hired" && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(app._id, "hired")}
                                                        disabled={actionLoading === app._id}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer disabled:opacity-50"
                                                    >
                                                        <FaAward /> Hire
                                                    </button>
                                                )}
                                                {app.status !== "rejected" && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(app._id, "rejected")}
                                                        disabled={actionLoading === app._id}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 cursor-pointer disabled:opacity-50"
                                                    >
                                                        <FaTimes /> Reject
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default JobApplicantsPage;
