import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createProfile } from "../services/profileService";
import { setOnboardingCompleted } from "../redux/slices/authSlice";
import api from "../api/axios";
import {
    FaUser, FaGraduationCap, FaBriefcase, FaProjectDiagram,
    FaCertificate, FaUpload, FaPlus, FaTrash, FaSpinner, FaArrowRight, FaCheckCircle
} from "react-icons/fa";

const EMPTY_EDUCATION = { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "", description: "" };
const EMPTY_EXPERIENCE = { company: "", title: "", location: "", startDate: "", endDate: "", current: false, description: "" };
const EMPTY_PROJECT = { title: "", description: "", technologies: "", url: "", startDate: "", endDate: "" };
const EMPTY_CERTIFICATION = { name: "", issuer: "", issueDate: "", expiryDate: "", url: "" };

const sections = [
    { key: "personal", label: "Personal Details", icon: FaUser },
    { key: "skills", label: "Skills", icon: FaCheckCircle },
    { key: "education", label: "Education", icon: FaGraduationCap },
    { key: "experience", label: "Work Experience", icon: FaBriefcase },
    { key: "projects", label: "Projects", icon: FaProjectDiagram },
    { key: "certifications", label: "Certifications", icon: FaCertificate },
    { key: "resume", label: "Resume Upload", icon: FaUpload },
];

const OnboardingPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [submitting, setSubmitting] = useState(false);
    const [activeSection, setActiveSection] = useState("personal");

    const [personal, setPersonal] = useState({
        phone: "", bio: "", location: "", dateOfBirth: "", linkedIn: "", github: "", website: "",
    });
    const [skillsInput, setSkillsInput] = useState("");
    const [skills, setSkills] = useState([]);
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [projects, setProjects] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [resumeFile, setResumeFile] = useState(null);
    const [skipResume, setSkipResume] = useState(false);

    const handlePersonalChange = (field) => (e) => {
        setPersonal((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const addSkill = () => {
        const trimmed = skillsInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills((prev) => [...prev, trimmed]);
            setSkillsInput("");
        }
    };

    const removeSkill = (skill) => {
        setSkills((prev) => prev.filter((s) => s !== skill));
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addSkill();
        }
    };

    const addArrayItem = (setter) => {
        setter((prev) => [...prev, {}]);
    };

    const removeArrayItem = (setter, index) => {
        setter((prev) => prev.filter((_, i) => i !== index));
    };

    const handleArrayFieldChange = (setter, index, field) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setter((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (activeSection !== "resume") return;

        if (!resumeFile && !skipResume) {
            toast.error("Please upload a resume or check 'I will upload later' to continue.");
            return;
        }

        setSubmitting(true);

        try {
            let resumeUrl = "";
            if (resumeFile) {
                const formData = new FormData();
                formData.append("resume", resumeFile);
                const uploadRes = await api.put("/users/upload-resume", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                if (uploadRes.data?.success) {
                    resumeUrl = uploadRes.data.resumeUrl || uploadRes.data.user?.resumeUrl || "";
                }
            }

            const payload = {
                personalDetails: {
                    ...personal,
                    dateOfBirth: personal.dateOfBirth || null,
                },
                skills,
                education: education.map((e) => ({
                    ...e,
                    startDate: e.startDate || null,
                    endDate: e.endDate || null,
                })),
                workExperience: experience.map((e) => ({
                    ...e,
                    startDate: e.startDate || null,
                    endDate: e.endDate || null,
                })),
                projects: projects.map((p) => ({
                    ...p,
                    technologies: p.technologies ? p.technologies.split(",").map((t) => t.trim()).filter(Boolean) : [],
                    startDate: p.startDate || null,
                    endDate: p.endDate || null,
                })),
                certifications: certifications.map((c) => ({
                    ...c,
                    issueDate: c.issueDate || null,
                    expiryDate: c.expiryDate || null,
                })),
                resumeUrl,
            };

            const res = await createProfile(payload);
            if (res.data?.success) {
                dispatch(setOnboardingCompleted(true));
                toast.success("Profile completed successfully!");
                navigate("/dashboard/job-seeker");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save profile");
        } finally {
            setSubmitting(false);
        }
    };

    const sectionIndex = sections.findIndex((s) => s.key === activeSection);

    const goToNext = () => {
        if (sectionIndex < sections.length - 1) {
            setActiveSection(sections[sectionIndex + 1].key);
        }
    };

    const goToPrev = () => {
        if (sectionIndex > 0) {
            setActiveSection(sections[sectionIndex - 1].key);
        }
    };

    const inputClass = "w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all";
    const labelClass = "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5";
    const cardClass = "p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-xl";

    const renderPersonal = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className={labelClass}>Full Name</label>
                <input className={inputClass} value={user?.name || ""} disabled />
            </div>
            <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} value={user?.email || ""} disabled />
            </div>
            <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} placeholder="+1 (555) 123-4567" value={personal.phone} onChange={handlePersonalChange("phone")} />
            </div>
            <div>
                <label className={labelClass}>Location</label>
                <input className={inputClass} placeholder="City, State, Country" value={personal.location} onChange={handlePersonalChange("location")} />
            </div>
            <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" className={inputClass} value={personal.dateOfBirth} onChange={handlePersonalChange("dateOfBirth")} />
            </div>
            <div>
                <label className={labelClass}>LinkedIn URL</label>
                <input className={inputClass} placeholder="https://linkedin.com/in/..." value={personal.linkedIn} onChange={handlePersonalChange("linkedIn")} />
            </div>
            <div>
                <label className={labelClass}>GitHub URL</label>
                <input className={inputClass} placeholder="https://github.com/..." value={personal.github} onChange={handlePersonalChange("github")} />
            </div>
            <div>
                <label className={labelClass}>Personal Website</label>
                <input className={inputClass} placeholder="https://..." value={personal.website} onChange={handlePersonalChange("website")} />
            </div>
            <div className="md:col-span-2">
                <label className={labelClass}>Bio / Summary</label>
                <textarea className={inputClass + " min-h-[100px]"} placeholder="Write a short professional summary..." value={personal.bio} onChange={handlePersonalChange("bio")} />
            </div>
        </div>
    );

    const renderSkills = () => (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input
                    className={inputClass + " flex-1"}
                    placeholder="Type a skill and press Enter or Add"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                />
                <button type="button" onClick={addSkill} className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all">
                    Add
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-sm">
                        {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors">
                            <FaTrash size={10} />
                        </button>
                    </span>
                ))}
            </div>
            {skills.length === 0 && <p className="text-sm text-slate-500 italic">Add at least a few skills to help recruiters find you.</p>}
        </div>
    );

    const renderArraySection = (items, setter, fields, emptyItem, label, itemLabel) => (
        <div className="space-y-6">
            {items.map((item, index) => (
                <div key={index} className="relative p-5 rounded-xl border border-slate-300/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/30">
                    <button
                        type="button"
                        onClick={() => removeArrayItem(setter, index)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                        <FaTrash size={12} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map((f) => (
                            <div key={f.key} className={f.fullWidth ? "md:col-span-2" : ""}>
                                <label className={labelClass}>{f.label}</label>
                                {f.type === "textarea" ? (
                                    <textarea className={inputClass + " min-h-[80px]"} placeholder={f.placeholder || ""} value={item[f.key] || ""} onChange={handleArrayFieldChange(setter, index, f.key)} />
                                ) : f.type === "checkbox" ? (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500" checked={!!item[f.key]} onChange={handleArrayFieldChange(setter, index, f.key)} />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">I currently work here</span>
                                    </label>
                                ) : f.type === "date" ? (
                                    <input type="date" className={inputClass} value={item[f.key] || ""} onChange={handleArrayFieldChange(setter, index, f.key)} />
                                ) : (
                                    <input className={inputClass} placeholder={f.placeholder || ""} value={item[f.key] || ""} onChange={handleArrayFieldChange(setter, index, f.key)} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={() => addArrayItem(setter)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-indigo-500 transition-all text-sm font-medium"
            >
                <FaPlus /> Add {itemLabel}
            </button>
        </div>
    );

    const educationFields = [
        { key: "institution", label: "Institution", placeholder: "University name" },
        { key: "degree", label: "Degree", placeholder: "e.g. B.Sc. Computer Science" },
        { key: "fieldOfStudy", label: "Field of Study", placeholder: "e.g. Computer Science" },
        { key: "startDate", label: "Start Date", type: "date" },
        { key: "endDate", label: "End Date (or expected)", type: "date" },
        { key: "grade", label: "Grade / GPA", placeholder: "e.g. 3.8 GPA" },
        { key: "description", label: "Description", type: "textarea", fullWidth: true, placeholder: "Honors, activities, etc." },
    ];

    const experienceFields = [
        { key: "company", label: "Company", placeholder: "Company name" },
        { key: "title", label: "Job Title", placeholder: "e.g. Software Engineer" },
        { key: "location", label: "Location", placeholder: "City, State" },
        { key: "startDate", label: "Start Date", type: "date" },
        { key: "endDate", label: "End Date", type: "date" },
        { key: "current", label: "Current Position", type: "checkbox" },
        { key: "description", label: "Description", type: "textarea", fullWidth: true, placeholder: "Describe your responsibilities and achievements..." },
    ];

    const projectFields = [
        { key: "title", label: "Project Title", placeholder: "Project name" },
        { key: "description", label: "Description", type: "textarea", fullWidth: true, placeholder: "Describe the project, your role, and impact..." },
        { key: "technologies", label: "Technologies (comma separated)", placeholder: "React, Node.js, MongoDB" },
        { key: "url", label: "URL (optional)", placeholder: "https://github.com/..." },
        { key: "startDate", label: "Start Date", type: "date" },
        { key: "endDate", label: "End Date", type: "date" },
    ];

    const certificationFields = [
        { key: "name", label: "Certification Name", placeholder: "e.g. AWS Certified Developer" },
        { key: "issuer", label: "Issuer", placeholder: "e.g. Amazon Web Services" },
        { key: "issueDate", label: "Issue Date", type: "date" },
        { key: "expiryDate", label: "Expiry Date", type: "date" },
        { key: "url", label: "Credential URL (optional)", placeholder: "https://..." },
    ];

    const renderResume = () => (
        <div className="space-y-4">
            <label className={labelClass}>Upload Resume (PDF)</label>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 px-6 py-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 cursor-pointer transition-all bg-slate-50 dark:bg-slate-800/30 flex-1">
                    <FaUpload className="text-indigo-400 text-xl" />
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{resumeFile ? resumeFile.name : "Click to upload PDF"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Max 5MB, PDF only</p>
                    </div>
                    <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { setResumeFile(e.target.files[0] || null); setSkipResume(false); }} />
                </label>
                {resumeFile && (
                    <button type="button" onClick={() => setResumeFile(null)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                        <FaTrash size={14} />
                    </button>
                )}
            </div>
            {!resumeFile && (
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={skipResume}
                        onChange={(e) => setSkipResume(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                        I will upload my resume later
                    </span>
                </label>
            )}
        </div>
    );

    const renderSection = () => {
        switch (activeSection) {
            case "personal": return renderPersonal();
            case "skills": return renderSkills();
            case "education": return renderArraySection(education, setEducation, educationFields, EMPTY_EDUCATION, "Education", "Education");
            case "experience": return renderArraySection(experience, setExperience, experienceFields, EMPTY_EXPERIENCE, "Experience", "Experience");
            case "projects": return renderArraySection(projects, setProjects, projectFields, EMPTY_PROJECT, "Projects", "Project");
            case "certifications": return renderArraySection(certifications, setCertifications, certificationFields, EMPTY_CERTIFICATION, "Certifications", "Certification");
            case "resume": return renderResume();
            default: return null;
        }
    };

    const completedSections = () => {
        let count = 0;
        if (personal.phone || personal.bio || personal.location) count++;
        if (skills.length > 0) count++;
        if (education.length > 0) count++;
        if (experience.length > 0) count++;
        if (projects.length > 0) count++;
        if (certifications.length > 0) count++;
        if (resumeFile) count++;
        return count;
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Complete Your Profile</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Fill in your details to help recruiters discover you. This only takes a few minutes.</p>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
                        <span>Profile Completion</span>
                        <span>{Math.round((completedSections() / 7) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${(completedSections() / 7) * 100}%` }} />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {sections.map((s) => {
                        const Icon = s.icon;
                        const isActive = activeSection === s.key;
                        return (
                            <button
                                key={s.key}
                                type="button"
                                onClick={() => setActiveSection(s.key)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/60"
                                }`}
                            >
                                <Icon size={14} />
                                {s.label}
                            </button>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}>
                    <div className={cardClass}>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{sections.find((s) => s.key === activeSection)?.label}</h2>
                        {renderSection()}
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        <div>
                            {sectionIndex > 0 && (
                                <button type="button" onClick={goToPrev} className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-sm font-medium">
                                    Previous
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {sectionIndex < sections.length - 1 ? (
                                <button type="button" onClick={goToNext} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20">
                                    Next <FaArrowRight size={12} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                                >
                                    {submitting ? <FaSpinner className="animate-spin" /> : "Complete Profile"}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OnboardingPage;
