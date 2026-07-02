import { useEffect, useState } from "react";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { 
    FaSearch, 
    FaTrashAlt, 
    FaToggleOn, 
    FaToggleOff, 
    FaSpinner 
} from "react-icons/fa";
import toast from "react-hot-toast";

const AdminJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingJobId, setUpdatingJobId] = useState(null);
    const [deletingJobId, setDeletingJobId] = useState(null);

    const loadJobs = async () => {
        try {
            const res = await api.get("/admin/jobs");
            if (res.data && res.data.success) {
                setJobs(res.data.jobs || []);
                setFilteredJobs(res.data.jobs || []);
            }
        } catch (err) {
            console.error("Error loading jobs list:", err);
            toast.error("Failed to load jobs moderation panel");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    // Search filter logic
    useEffect(() => {
        const query = searchQuery.toLowerCase().trim();
        if (query === "") {
            setFilteredJobs(jobs);
        } else {
            setFilteredJobs(
                jobs.filter(j => 
                    j.title?.toLowerCase().includes(query) ||
                    j.company?.toLowerCase().includes(query) ||
                    j.location?.toLowerCase().includes(query) ||
                    j.recruiter?.name?.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, jobs]);

    const handleToggleStatus = async (job) => {
        const newStatus = !job.isActive;
        setUpdatingJobId(job._id);
        try {
            const res = await api.put(`/jobs/${job._id}`, { isActive: newStatus });
            if (res.data && res.data.success) {
                setJobs(prev => 
                    prev.map(j => j._id === job._id ? { ...j, isActive: newStatus } : j)
                );
                toast.success(`Job listing is now ${newStatus ? "active" : "deactivated"}`);
            }
        } catch (err) {
            console.error("Error toggling job status:", err);
            toast.error("Failed to update status");
        } finally {
            setUpdatingJobId(null);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to permanently remove this job posting?")) return;
        
        setDeletingJobId(jobId);
        try {
            const res = await api.delete(`/jobs/${jobId}`);
            if (res.data && res.data.success) {
                setJobs(prev => prev.filter(j => j._id !== jobId));
                toast.success("Job posting deleted successfully");
            }
        } catch (err) {
            console.error("Error deleting job posting:", err);
            toast.error("Failed to delete listing");
        } finally {
            setDeletingJobId(null);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Moderate Job Postings</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit active job listings, toggle visibility status, or delete spam posts.</p>
                </div>

                {/* Search Board */}
                <div className="flex gap-4 items-center bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by title, company, location, recruiter..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                        />
                    </div>
                </div>

                {/* Jobs Table */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                                    <th className="py-3 px-4">Listing Title</th>
                                    <th className="py-3 px-4">Company Name</th>
                                    <th className="py-3 px-4">Location</th>
                                    <th className="py-3 px-4">Posted By</th>
                                    <th className="py-3 px-4">Current Status</th>
                                    <th className="py-3 px-4 text-right">Moderator Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobs.map((j) => (
                                    <tr key={j._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                        <td className="py-4 px-4 font-semibold text-slate-800 dark:text-white">{j.title}</td>
                                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{j.company}</td>
                                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{j.location}</td>
                                        <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                            {j.recruiter ? (
                                                <>
                                                    <span className="block text-slate-900 dark:text-white font-bold">{j.recruiter.name}</span>
                                                    <span>{j.recruiter.email}</span>
                                                </>
                                            ) : "System Bot"}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                                j.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20"
                                            }`}>
                                                {j.isActive ? "Active" : "Closed"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right flex items-center justify-end gap-3 h-16">
                                            <button
                                                onClick={() => handleToggleStatus(j)}
                                                disabled={updatingJobId === j._id}
                                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                                    j.isActive
                                                        ? "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20 text-amber-600 dark:text-amber-400"
                                                        : "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                                }`}
                                            >
                                                {updatingJobId === j._id ? (
                                                    <FaSpinner className="animate-spin" />
                                                ) : j.isActive ? (
                                                    <FaToggleOff className="text-sm" />
                                                ) : (
                                                    <FaToggleOn className="text-sm" />
                                                )}
                                                <span>{j.isActive ? "Deactivate" : "Activate"}</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteJob(j._id)}
                                                disabled={deletingJobId === j._id}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/15 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
                                            >
                                                {deletingJobId === j._id ? (
                                                    <FaSpinner className="animate-spin" />
                                                ) : (
                                                    <FaTrashAlt />
                                                )}
                                                <span>Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredJobs.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-slate-500 italic">No job postings found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminJobsPage;
