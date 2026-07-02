import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaEdit, FaTrash, FaUsers, FaPlus, FaBriefcase, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const ManageJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRecruiterJobs = async () => {
        try {
            const userRes = await api.get("/users/me");
            const recruiterId = userRes.data.user?._id;

            const jobsRes = await api.get("/jobs/get-job?limit=100");
            const allJobs = jobsRes.data.jobs || [];

            const recruiterJobs = allJobs.filter((j) => j.recruiter === recruiterId);
            setJobs(recruiterJobs);
        } catch (err) {
            console.error("Error loading recruiter jobs:", err);
            toast.error("Failed to load your job postings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecruiterJobs();
    }, []);

    const toggleJobStatus = async (jobId, currentStatus) => {
        try {
            const res = await api.put(`/jobs/${jobId}`, { isActive: !currentStatus });
            if (res.data && res.data.success) {
                toast.success("Job status updated successfully!");
                loadRecruiterJobs();
            }
        } catch (err) {
            console.error("Error toggling job status:", err);
            toast.error("Failed to update job status");
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job posting? This cannot be undone.")) return;

        try {
            const res = await api.delete(`/jobs/${jobId}`);
            if (res.data && res.data.success) {
                toast.success("Job posting deleted successfully!");
                loadRecruiterJobs();
            }
        } catch (err) {
            console.error("Error deleting job:", err);
            toast.error("Failed to delete job posting");
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
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manage Jobs</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review status, modify details, and view job applications.</p>
                    </div>
                    <Link to="/recruiter/jobs/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto">
                        <FaPlus /> Create Job
                    </Link>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
                    {jobs.length === 0 ? (
                        <div className="text-center py-16">
                            <FaBriefcase className="mx-auto text-4xl text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No jobs posted yet</h3>
                            <p className="text-sm text-slate-500 mt-1">Publish roles to find matches using our AI parser.</p>
                            <Link to="/recruiter/jobs/new" className="mt-6 inline-flex justify-center text-sm font-semibold px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white">Create First Job</Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                                        <th className="py-3 px-4">Title</th>
                                        <th className="py-3 px-4">Location</th>
                                        <th className="py-3 px-4">Type</th>
                                        <th className="py-3 px-4">Salary Range</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map((job) => (
                                        <tr key={job._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-800 dark:text-white">
                                                <Link to={`/jobs/${job._id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">{job.title}</Link>
                                            </td>
                                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{job.location}</td>
                                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400 capitalize">{job.employmentType}</td>
                                            <td className="py-4 px-4 text-indigo-600 dark:text-indigo-400 font-bold">{job.salaryMin ? `$${job.salaryMin}k - $${job.salaryMax}k` : "Salary N/A"}</td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => toggleJobStatus(job._id, job.isActive)}
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                                                        job.isActive
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                                            : "bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20 hover:bg-slate-500/20"
                                                    }`}
                                                >
                                                    {job.isActive ? "Active" : "Inactive"}
                                                </button>
                                            </td>
                                            <td className="py-4 px-4 text-right space-x-3">
                                                <Link
                                                    to={`/recruiter/jobs/${job._id}/applications`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                                                    title="View Applicants"
                                                >
                                                    <FaUsers /> Applicants
                                                </Link>
                                                <Link
                                                    to={`/recruiter/jobs/${job._id}/edit`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    title="Edit Details"
                                                >
                                                    <FaEdit /> Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteJob(job._id)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
                                                    title="Delete Posting"
                                                >
                                                    <FaTrash /> Delete
                                                </button>
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

export default ManageJobsPage;
