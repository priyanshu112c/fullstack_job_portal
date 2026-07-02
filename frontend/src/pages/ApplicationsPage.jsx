import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaBriefcase, FaEnvelope, FaClock, FaSpinner, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const ApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const loadApplications = async () => {
        try {
            const res = await api.get("/applications/me");
            if (res.data && res.data.success) {
                setApplications(res.data.applications || []);
            }
        } catch (err) {
            console.error("Error fetching applications:", err);
            toast.error("Failed to load applications list");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (applicationId) => {
        if (!window.confirm("Are you sure you want to delete this application?")) return;

        setDeletingId(applicationId);
        try {
            const res = await api.delete(`/applications/${applicationId}`);
            if (res.data && res.data.success) {
                setApplications((prev) => prev.filter((app) => app._id !== applicationId));
                toast.success("Application deleted successfully");
            }
        } catch (err) {
            console.error("Error deleting application:", err);
            toast.error(err.response?.data?.message || "Failed to delete application");
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        loadApplications();
    }, []);

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
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Check the current review status of jobs you've applied to.</p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
                    {applications.length === 0 ? (
                        <div className="text-center py-16">
                            <FaBriefcase className="mx-auto text-4xl text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No applications sent</h3>
                            <p className="text-sm text-slate-500 mt-1">You haven't submitted any job applications yet.</p>
                            <Link to="/jobs" className="mt-6 inline-flex justify-center text-sm font-semibold px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white">Find Jobs Now</Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                                        <th className="py-3 px-4">Job Title</th>
                                        <th className="py-3 px-4">Company</th>
                                        <th className="py-3 px-4">Location</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Applied Date</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-800 dark:text-white">
                                                <Link to={`/jobs/${app.job?._id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">{app.job?.title || "Deleted Job"}</Link>
                                            </td>
                                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{app.job?.company || "N/A"}</td>
                                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{app.job?.location || "N/A"}</td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                                    app.status === "interview" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20" :
                                                    app.status === "hired" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                                                    app.status === "rejected" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" :
                                                    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                                }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{new Date(app.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {app.job?.recruiter && (
                                                        <Link to={`/messages?userId=${app.job.recruiter}`} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                            <FaEnvelope /> Chat
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(app._id)}
                                                        disabled={deletingId === app._id}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-300 dark:border-rose-700 transition-all disabled:opacity-50"
                                                    >
                                                        {deletingId === app._id ? <FaSpinner className="animate-spin" /> : <FaTrash />} Delete
                                                    </button>
                                                </div>
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

export default ApplicationsPage;
