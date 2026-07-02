import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import {
    FaArrowLeft, FaArrowRight, FaUser, FaEnvelope, FaBriefcase,
    FaMapMarkerAlt, FaPhone, FaGlobe, FaGithub, FaLinkedin,
    FaFileDownload, FaCheck, FaTimes, FaAward, FaSpinner,
    FaGraduationCap, FaBriefcase as FaWork, FaProjectDiagram,
    FaCertificate, FaTools, FaCalendarAlt, FaExternalLinkAlt
} from "react-icons/fa";
import toast from "react-hot-toast";

const statusStyles = {
    applied: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    reviewed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    interview: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    hired: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
    });
};

const SectionCard = ({ title, icon, children }) => (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>
            {title}
        </h3>
        {children}
    </div>
);

const CandidateProfilePage = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [application, setApplication] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);

    const { applicationIds, jobId, from } = location.state || {};

    const currentIndex = useMemo(() => {
        if (!applicationIds || !applicationId) return -1;
        return applicationIds.indexOf(applicationId);
    }, [applicationIds, applicationId]);

    const prevAppId = currentIndex > 0 ? applicationIds[currentIndex - 1] : null;
    const nextAppId = currentIndex >= 0 && currentIndex < applicationIds.length - 1
        ? applicationIds[currentIndex + 1]
        : null;

    const fetchApplication = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/applications/${applicationId}`);
            if (res.data && res.data.success) {
                setApplication(res.data.application);
                setProfile(res.data.profile);
            } else {
                setError("Application not found");
            }
        } catch (err) {
            console.error("Error loading application:", err);
            if (err.response?.status === 404) {
                setError("Application not found");
            } else if (err.response?.status === 403) {
                setError("You are not authorized to view this application");
            } else {
                setError("Failed to load candidate profile");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplication();
    }, [applicationId]);

    const handleStatusUpdate = async (newStatus) => {
        setActionLoading(newStatus);
        try {
            const res = await api.put(`/applications/${applicationId}/status`, { status: newStatus });
            if (res.data && res.data.success) {
                setApplication(prev => ({ ...prev, status: newStatus }));
                toast.success(`Candidate status updated to ${newStatus}`);
            }
        } catch (err) {
            console.error("Status update error:", err);
            toast.error("Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const navigateTo = (appId) => {
        navigate(`/recruiter/applications/${appId}`, {
            state: { applicationIds, jobId, from }
        });
    };

    const goBack = () => {
        if (from === "job" && jobId) {
            navigate(`/recruiter/jobs/${jobId}/applications`);
        } else {
            navigate("/recruiter/applications");
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="text-center py-16">
                    <FaUser className="mx-auto text-5xl text-slate-600 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">{error}</h2>
                    <button
                        onClick={goBack}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                        <FaArrowLeft /> Back to Applications
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    if (!application) {
        return (
            <DashboardLayout>
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300">Application not found</h2>
                    <button onClick={goBack} className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block cursor-pointer">
                        Back to Applications
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const applicant = application.applicant || {};
    const job = application.job || {};
    const hasProfile = profile && profile.personalDetails;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <button
                        onClick={goBack}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        <FaArrowLeft />
                        {from === "job" ? "Back to Job Applicants" : "Back to All Applications"}
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateTo(prevAppId)}
                            disabled={!prevAppId}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <FaArrowLeft /> Prev
                        </button>
                        <span className="text-xs text-slate-500 px-2">
                            {currentIndex >= 0 ? `${currentIndex + 1} / ${applicationIds?.length || "?"}` : ""}
                        </span>
                        <button
                            onClick={() => navigateTo(nextAppId)}
                            disabled={!nextAppId}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Next <FaArrowRight />
                        </button>
                    </div>
                </div>

                {/* Candidate Header Card */}
                <div className="p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/80 dark:to-slate-950/60 backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                            <FaUser />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">
                                    {applicant.name || "Unknown Candidate"}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${statusStyles[application.status] || statusStyles.applied}`}>
                                    {application.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-2">
                                <FaEnvelope className="text-slate-400 dark:text-slate-500" />
                                {applicant.email || "No email"}
                            </p>
                            {job.title && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                                    <FaBriefcase className="text-indigo-600 dark:text-indigo-400" />
                                    Applied for: <span className="font-semibold text-slate-600 dark:text-slate-300">{job.title}</span>
                                    {job.company && <span className="text-slate-400 dark:text-slate-500">at {job.company}</span>}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatusUpdate("interview")}
                                    disabled={actionLoading === "interview" || application.status === "interview" || application.status === "hired"}
                                    className="flex-1 md:flex-none inline-flex justify-center items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {actionLoading === "interview" ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                    Select
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate("rejected")}
                                    disabled={actionLoading === "rejected" || application.status === "rejected" || application.status === "hired"}
                                    className="flex-1 md:flex-none inline-flex justify-center items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {actionLoading === "rejected" ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate("hired")}
                                    disabled={actionLoading === "hired" || application.status === "hired"}
                                    className="flex-1 md:flex-none inline-flex justify-center items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {actionLoading === "hired" ? <FaSpinner className="animate-spin" /> : <FaAward />}
                                    Hire
                                </button>
                            </div>
                            {applicant.resumeUrl && (
                                <a
                                    href={applicant.resumeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex justify-center items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white transition-all text-center"
                                >
                                    <FaFileDownload /> Download Resume
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Profile */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About / Bio */}
                        {hasProfile && profile.personalDetails.bio && (
                            <SectionCard title="About" icon={<FaUser />}>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {profile.personalDetails.bio}
                                </p>
                            </SectionCard>
                        )}

                        {/* Work Experience */}
                        {hasProfile && profile.workExperience?.length > 0 && (
                            <SectionCard title="Work Experience" icon={<FaWork />}>
                                <div className="space-y-4">
                                    {profile.workExperience.map((exp, idx) => (
                                        <div key={idx} className="border-l-2 border-indigo-500/30 pl-4 pb-4 last:pb-0">
                                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{exp.title}</h4>
                                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{exp.company}</p>
                                                </div>
                                                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0">
                                                    <FaCalendarAlt />
                                                    {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                                                </span>
                                            </div>
                                            {exp.location && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{exp.location}</p>}
                                            {exp.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

                        {/* Education */}
                        {hasProfile && profile.education?.length > 0 && (
                            <SectionCard title="Education" icon={<FaGraduationCap />}>
                                <div className="space-y-4">
                                    {profile.education.map((edu, idx) => (
                                        <div key={idx} className="border-l-2 border-cyan-500/30 pl-4 pb-4 last:pb-0">
                                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{edu.degree} in {edu.fieldOfStudy}</h4>
                                                    <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">{edu.institution}</p>
                                                </div>
                                                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0">
                                                    <FaCalendarAlt />
                                                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                                </span>
                                            </div>
                                            {edu.grade && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Grade: {edu.grade}</p>}
                                            {edu.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{edu.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

                        {/* Projects */}
                        {hasProfile && profile.projects?.length > 0 && (
                            <SectionCard title="Projects" icon={<FaProjectDiagram />}>
                                <div className="space-y-4">
                                    {profile.projects.map((proj, idx) => (
                                        <div key={idx} className="border-l-2 border-emerald-500/30 pl-4 pb-4 last:pb-0">
                                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{proj.title}</h4>
                                                {proj.url && (
                                                    <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1">
                                                        <FaExternalLinkAlt /> View
                                                    </a>
                                                )}
                                            </div>
                                            {proj.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{proj.description}</p>
                                            )}
                                            {proj.technologies?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {proj.technologies.map((tech, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {(proj.startDate || proj.endDate) && (
                                                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-2">
                                                    <FaCalendarAlt />
                                                    {formatDate(proj.startDate)} - {formatDate(proj.endDate)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

                        {/* Certifications */}
                        {hasProfile && profile.certifications?.length > 0 && (
                            <SectionCard title="Certifications" icon={<FaCertificate />}>
                                <div className="space-y-3">
                                    {profile.certifications.map((cert, idx) => (
                                        <div key={idx} className="flex items-start justify-between gap-2 flex-wrap p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{cert.name}</h4>
                                                {cert.issuer && <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{cert.issuer}</p>}
                                            </div>
                                            <div className="text-right shrink-0">
                                                {cert.issueDate && (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 block">Issued: {formatDate(cert.issueDate)}</span>
                                                )}
                                                {cert.url && (
                                                    <a href={cert.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 mt-1 justify-end">
                                                        <FaExternalLinkAlt /> Verify
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

                        {/* No Profile Fallback */}
                        {!hasProfile && (
                            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 text-center">
                                <FaUser className="mx-auto text-3xl text-slate-600 mb-3" />
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">No detailed profile available</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                    This candidate has not completed their profile setup.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Quick Info & Skills */}
                    <div className="space-y-6">
                        {/* Contact & Links */}
                        <SectionCard title="Contact & Links" icon={<FaEnvelope />}>
                            <div className="space-y-3">
                                {hasProfile && profile.personalDetails.phone && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                        <FaPhone className="text-slate-400 dark:text-slate-500 w-3.5" />
                                        <span>{profile.personalDetails.phone}</span>
                                    </div>
                                )}
                                {hasProfile && profile.personalDetails.location && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                        <FaMapMarkerAlt className="text-slate-400 dark:text-slate-500 w-3.5" />
                                        <span>{profile.personalDetails.location}</span>
                                    </div>
                                )}
                                {hasProfile && profile.personalDetails.website && (
                                    <a href={profile.personalDetails.website} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                                        <FaGlobe className="w-3.5" />
                                        <span className="truncate">{profile.personalDetails.website}</span>
                                    </a>
                                )}
                                {hasProfile && profile.personalDetails.github && (
                                    <a href={profile.personalDetails.github} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                                        <FaGithub className="w-3.5" />
                                        <span className="truncate">{profile.personalDetails.github}</span>
                                    </a>
                                )}
                                {hasProfile && profile.personalDetails.linkedIn && (
                                    <a href={profile.personalDetails.linkedIn} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                                        <FaLinkedin className="w-3.5" />
                                        <span className="truncate">{profile.personalDetails.linkedIn}</span>
                                    </a>
                                )}
                                {(!hasProfile || (!profile.personalDetails.phone && !profile.personalDetails.location &&
                                    !profile.personalDetails.website && !profile.personalDetails.github && !profile.personalDetails.linkedIn)) && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500">No contact details provided</p>
                                )}
                            </div>
                        </SectionCard>

                        {/* Skills */}
                        <SectionCard title="Skills" icon={<FaTools />}>
                            {hasProfile && profile.skills?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, idx) => (
                                        <span key={idx}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-500 dark:text-indigo-300"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 dark:text-slate-500">No skills listed</p>
                            )}
                        </SectionCard>

                        {/* Quick Actions */}
                        <SectionCard title="Quick Actions" icon={<FaTools />}>
                            <div className="space-y-2">
                                {applicant._id && (
                                    <Link
                                        to={`/messages?userId=${applicant._id}`}
                                        className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all text-center"
                                    >
                                        Chat with Candidate
                                    </Link>
                                )}
                                {job._id && (
                                    <Link
                                        to={`/recruiter/jobs/${job._id}/applications`}
                                        className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-all text-center"
                                    >
                                        <FaBriefcase /> View All for This Job
                                    </Link>
                                )}
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CandidateProfilePage;
