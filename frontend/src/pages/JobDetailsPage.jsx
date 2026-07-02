import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { getMyProfile } from "../services/profileService";
import ConfirmModal from "../components/ConfirmModal";
import { FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaUserTie, FaArrowLeft, FaCheckCircle, FaSpinner, FaBuilding } from "react-icons/fa";
import toast from "react-hot-toast";

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { accessToken, role } = useSelector((state) => state.auth);
    const [job, setJob] = useState(null);
    const [hasApplied, setHasApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showIncompleteModal, setShowIncompleteModal] = useState(false);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const res = await api.get(`/jobs/${id}`);
                if (res.data && res.data.success) {
                    setJob(res.data.job);

                    if (accessToken && role === "job_seeker") {
                        const [appsRes, userRes, profileRes] = await Promise.all([
                            api.get("/applications/me"),
                            api.get("/users/me"),
                            getMyProfile().catch(() => ({ data: { success: false, profile: null } })),
                        ]);
                        const applied = appsRes.data.applications?.some((app) => app.job?._id === id);
                        setHasApplied(!!applied);
                        if (userRes.data?.success) {
                            setUser(userRes.data.user);
                        }
                        if (profileRes.data?.success) {
                            setProfile(profileRes.data.profile);
                        }
                    }
                } else {
                    toast.error("Job posting not found");
                    navigate("/jobs");
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    toast.error("Job posting not found");
                    navigate("/jobs");
                } else {
                    console.error("Error loading job details:", err);
                    toast.error("Failed to load job details");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchJobDetails();
    }, [id, accessToken, role]);

    const isProfileComplete = (profile) => {
        if (!profile) return false;
        const pd = profile.personalDetails || {};
        const hasPersonalDetails = !!(pd.phone || pd.bio || pd.location);
        const hasSkills = (profile.skills || []).length > 0;
        const hasEducation = (profile.education || []).length > 0;
        const hasExperience = (profile.workExperience || []).length > 0;
        return hasPersonalDetails && hasSkills && hasEducation && hasExperience;
    };

    const handleApplyClick = async () => {
        if (!accessToken) {
            toast.error("Please login to apply!");
            navigate("/login");
            return;
        }

        const resumeUrl = user?.resumeUrl;
        if (!resumeUrl) {
            toast.error("Please upload your resume before applying to jobs.");
            navigate("/profile");
            return;
        }

        if (!isProfileComplete(profile)) {
            setShowIncompleteModal(true);
            return;
        }

        await submitApplication();
    };

    const submitApplication = async () => {
        setApplying(true);
        try {
            const res = await api.post(`/applications/jobs/${id}/apply`);
            if (res.data && res.data.success) {
                toast.success("Application submitted successfully!");
                setHasApplied(true);
            }
        } catch (err) {
            console.error("Error applying to job:", err);
            toast.error(err.response?.data?.message || "Application failed");
        } finally {
            setApplying(false);
        }
    };

    const handleConfirmIncomplete = async () => {
        setShowIncompleteModal(false);
        await submitApplication();
    };

    const handleCancelIncomplete = () => {
        setShowIncompleteModal(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center">
                <FaSpinner className="animate-spin text-3xl text-indigo-600 dark:text-indigo-400" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center">
                <p>Job not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link to={role === "recruiter" || role === "admin" ? "/recruiter/jobs" : "/jobs"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <FaArrowLeft /> Back to jobs
                </Link>

                <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-xl space-y-6">
                    {/* Main Title Section */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                        <div className="space-y-2">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">{job.employmentType}</span>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">{job.title}</h1>
                            <div className="flex items-center gap-2">
                                {job.companyLogo ? (
                                    <img src={job.companyLogo} alt={job.company} className="w-8 h-8 rounded object-contain" />
                                ) : (
                                    <FaBuilding className="text-xl text-slate-400 dark:text-slate-500 shrink-0" />
                                )}
                                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">{job.company}</p>
                            </div>
                        </div>
                        <div>
                            {role === "recruiter" || role === "admin" ? (
                                <p className="text-sm text-slate-400 dark:text-slate-500 italic">Logged in as {role}</p>
                            ) : hasApplied ? (
                                <button disabled className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-sm">
                                    <FaCheckCircle /> Applied
                                </button>
                            ) : (
                                <button
                                    onClick={handleApplyClick}
                                    disabled={applying}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60"
                                >
                                    {applying ? <FaSpinner className="animate-spin" /> : "Apply Now"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Metadata strip */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <FaMapMarkerAlt className="text-indigo-600 dark:text-indigo-400" />
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <FaBriefcase className="text-indigo-600 dark:text-indigo-400" />
                            <span className="capitalize">{job.employmentType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 col-span-2 md:col-span-1">
                            <FaDollarSign className="text-indigo-600 dark:text-indigo-400" />
                            <span>{job.salaryMin ? `$${job.salaryMin}k - $${job.salaryMax}k` : "Salary Undisclosed"}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Job Description</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">{job.description}</p>
                    </div>

                    {/* Skills Required */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.skills?.map((skill, index) => (
                                <span key={index} className="text-xs px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">{skill}</span>
                            ))}
                        </div>
                    </div>

                    {/* Recruiter contact if logged in */}
                    {accessToken && job.recruiter && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <FaUserTie className="text-slate-500 dark:text-slate-400 text-lg" />
                                <span className="text-xs text-slate-500 dark:text-slate-400">Published by recruiter</span>
                            </div>
                            <Link to={`/messages?userId=${job.recruiter}`} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline">
                                Start chat conversation &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={showIncompleteModal}
                onClose={handleCancelIncomplete}
                onConfirm={handleConfirmIncomplete}
                title="Incomplete Profile"
                message="Your profile is missing some details. Do you wish to proceed with the application despite the incomplete profile?"
                confirmLabel="Proceed Anyway"
                cancelLabel="Cancel"
            />
        </div>
    );
};

export default JobDetailsPage;
