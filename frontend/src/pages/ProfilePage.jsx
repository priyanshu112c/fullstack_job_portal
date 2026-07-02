import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { getMyProfile, updateProfile } from "../services/profileService";
import { getMyCompany } from "../services/companyService";
import { useSelector } from "react-redux";
import DashboardLayout from "../layouts/DashboardLayout";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt,
    FaLinkedin, FaGithub, FaGlobe, FaFilePdf, FaCloudUploadAlt,
    FaSpinner, FaCheckCircle, FaGraduationCap, FaBriefcase,
    FaProjectDiagram, FaCertificate, FaPlus, FaTrash, FaEdit,
    FaTimes, FaSave, FaExternalLinkAlt, FaArrowRight, FaBuilding, FaLink
} from "react-icons/fa";

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const toDateInputValue = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
};

const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all";
const labelClass = "block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5";
const cardClass = "p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl";
const sectionHeaderClass = "flex items-center justify-between mb-6";
const badgeClass = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-sm";

const EMPTY_EDUCATION = { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "", description: "" };
const EMPTY_EXPERIENCE = { company: "", title: "", location: "", startDate: "", endDate: "", current: false, description: "" };
const EMPTY_PROJECT = { title: "", description: "", technologies: "", url: "", startDate: "", endDate: "" };
const EMPTY_CERTIFICATION = { name: "", issuer: "", issueDate: "", expiryDate: "", url: "" };

const SECTIONS = [
    { key: "personal", label: "Personal Details", icon: FaUser },
    { key: "skills", label: "Skills", icon: FaCheckCircle },
    { key: "education", label: "Education", icon: FaGraduationCap },
    { key: "experience", label: "Work Experience", icon: FaBriefcase },
    { key: "projects", label: "Projects", icon: FaProjectDiagram },
    { key: "certifications", label: "Certifications", icon: FaCertificate },
    { key: "resume", label: "Resume", icon: FaFilePdf },
];

const ProfilePage = () => {
    const authRole = useSelector((state) => state?.auth?.role);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingSection, setEditingSection] = useState(null);

    // Edit form data
    const [editPersonal, setEditPersonal] = useState({});
    const [editSkills, setEditSkills] = useState([]);
    const [editSkillsInput, setEditSkillsInput] = useState("");
    const [editEducation, setEditEducation] = useState([]);
    const [editExperience, setEditExperience] = useState([]);
    const [editProjects, setEditProjects] = useState([]);
    const [editCertifications, setEditCertifications] = useState([]);

    const loadProfile = useCallback(async () => {
        try {
            if (authRole === "recruiter") {
                const [userRes, companyRes] = await Promise.all([
                    api.get("/users/me"),
                    getMyCompany(),
                ]);
                if (userRes.data?.success) {
                    setUser(userRes.data.user);
                }
                if (companyRes.data?.success && companyRes.data?.company) {
                    setCompany(companyRes.data.company);
                }
            } else {
                const [userRes, profileRes] = await Promise.all([
                    api.get("/users/me"),
                    getMyProfile(),
                ]);
                if (userRes.data?.success) {
                    setUser(userRes.data.user);
                }
                if (profileRes.data?.success) {
                    setProfile(profileRes.data.profile);
                }
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setProfile(null);
            } else {
                console.error("Error loading profile:", err);
                toast.error("Failed to load profile data");
            }
        } finally {
            setLoading(false);
        }
    }, [authRole]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const startEditing = (section) => {
        setEditingSection(section);
        switch (section) {
            case "personal":
                setEditPersonal({
                    name: user?.name || "",
                    email: user?.email || "",
                    phone: profile?.personalDetails?.phone || "",
                    location: profile?.personalDetails?.location || "",
                    bio: profile?.personalDetails?.bio || "",
                    dateOfBirth: profile?.personalDetails?.dateOfBirth ? toDateInputValue(profile.personalDetails.dateOfBirth) : "",
                    linkedIn: profile?.personalDetails?.linkedIn || "",
                    github: profile?.personalDetails?.github || "",
                    website: profile?.personalDetails?.website || "",
                });
                break;
            case "skills":
                setEditSkills([...(profile?.skills || [])]);
                setEditSkillsInput("");
                break;
            case "education":
                setEditEducation(JSON.parse(JSON.stringify(profile?.education || [])));
                break;
            case "experience":
                setEditExperience(JSON.parse(JSON.stringify(profile?.workExperience || [])));
                break;
            case "projects":
                setEditProjects(JSON.parse(JSON.stringify(profile?.projects || [])));
                break;
            case "certifications":
                setEditCertifications(JSON.parse(JSON.stringify(profile?.certifications || [])));
                break;
        }
    };

    const cancelEditing = () => {
        setEditingSection(null);
    };

    const handlePersonalChange = (field) => (e) => {
        setEditPersonal((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const addSkill = () => {
        const trimmed = editSkillsInput.trim();
        if (trimmed && !editSkills.includes(trimmed)) {
            setEditSkills((prev) => [...prev, trimmed]);
            setEditSkillsInput("");
        }
    };

    const removeSkill = (skill) => {
        setEditSkills((prev) => prev.filter((s) => s !== skill));
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

    const savePersonal = async () => {
        setSaving(true);
        try {
            await api.put("/users/profile", {
                name: editPersonal.name,
                email: editPersonal.email,
            });

            if (authRole !== "recruiter") {
                await updateProfile({
                    personalDetails: {
                        phone: editPersonal.phone || "",
                        bio: editPersonal.bio || "",
                        location: editPersonal.location || "",
                        dateOfBirth: editPersonal.dateOfBirth || null,
                        linkedIn: editPersonal.linkedIn || "",
                        github: editPersonal.github || "",
                        website: editPersonal.website || "",
                    },
                    education: profile?.education || [],
                    workExperience: profile?.workExperience || [],
                    projects: profile?.projects || [],
                    certifications: profile?.certifications || [],
                    skills: profile?.skills || [],
                    resumeUrl: profile?.resumeUrl || "",
                    resumePublicId: profile?.resumePublicId || "",
                });
            }

            toast.success("Personal details updated!");
            setEditingSection(null);
            await loadProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const saveSection = async (section) => {
        setSaving(true);
        try {
            let sectionData = {};

            switch (section) {
                case "skills":
                    sectionData = {
                        skills: editSkills,
                        personalDetails: profile?.personalDetails || {},
                        education: profile?.education || [],
                        workExperience: profile?.workExperience || [],
                        projects: profile?.projects || [],
                        certifications: profile?.certifications || [],
                        resumeUrl: profile?.resumeUrl || "",
                        resumePublicId: profile?.resumePublicId || "",
                    };
                    break;
                case "education":
                    sectionData = {
                        education: editEducation.map((e) => ({
                            ...e,
                            startDate: e.startDate || null,
                            endDate: e.endDate || null,
                        })),
                        personalDetails: profile?.personalDetails || {},
                        skills: profile?.skills || [],
                        workExperience: profile?.workExperience || [],
                        projects: profile?.projects || [],
                        certifications: profile?.certifications || [],
                        resumeUrl: profile?.resumeUrl || "",
                        resumePublicId: profile?.resumePublicId || "",
                    };
                    break;
                case "experience":
                    sectionData = {
                        workExperience: editExperience.map((e) => ({
                            ...e,
                            startDate: e.startDate || null,
                            endDate: e.endDate || null,
                        })),
                        personalDetails: profile?.personalDetails || {},
                        skills: profile?.skills || [],
                        education: profile?.education || [],
                        projects: profile?.projects || [],
                        certifications: profile?.certifications || [],
                        resumeUrl: profile?.resumeUrl || "",
                        resumePublicId: profile?.resumePublicId || "",
                    };
                    break;
                case "projects":
                    sectionData = {
                        projects: editProjects.map((p) => ({
                            ...p,
                            technologies: p.technologies
                                ? (Array.isArray(p.technologies)
                                    ? p.technologies
                                    : p.technologies.split(",").map((t) => t.trim()).filter(Boolean))
                                : [],
                            startDate: p.startDate || null,
                            endDate: p.endDate || null,
                        })),
                        personalDetails: profile?.personalDetails || {},
                        skills: profile?.skills || [],
                        education: profile?.education || [],
                        workExperience: profile?.workExperience || [],
                        certifications: profile?.certifications || [],
                        resumeUrl: profile?.resumeUrl || "",
                        resumePublicId: profile?.resumePublicId || "",
                    };
                    break;
                case "certifications":
                    sectionData = {
                        certifications: editCertifications.map((c) => ({
                            ...c,
                            issueDate: c.issueDate || null,
                            expiryDate: c.expiryDate || null,
                        })),
                        personalDetails: profile?.personalDetails || {},
                        skills: profile?.skills || [],
                        education: profile?.education || [],
                        workExperience: profile?.workExperience || [],
                        projects: profile?.projects || [],
                        resumeUrl: profile?.resumeUrl || "",
                        resumePublicId: profile?.resumePublicId || "",
                    };
                    break;
            }

            const res = await updateProfile(sectionData);
            if (res.data?.success) {
                toast.success(`${SECTIONS.find((s) => s.key === section)?.label} updated!`);
                setEditingSection(null);
                await loadProfile();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Only PDF files are allowed!");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);

        setUploading(true);
        try {
            const res = await api.put("/users/upload-resume", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data?.success) {
                toast.success("Resume uploaded successfully!");
                await loadProfile();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Resume upload failed");
        } finally {
            setUploading(false);
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

    const renderValue = (label, value, icon) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-3">
                <div className="mt-0.5 text-slate-400 dark:text-slate-500">{icon}</div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">{label}</p>
                    {icon.type === FaGlobe || icon.type === FaLinkedin || icon.type === FaGithub ? (
                        <a href={value} target="_blank" rel="noreferrer" className="text-sm text-indigo-500 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                            {value} <FaExternalLinkAlt size={10} />
                        </a>
                    ) : (
                        <p className="text-sm text-slate-700 dark:text-slate-300">{value}</p>
                    )}
                </div>
            </div>
        );
    };

    const renderPersonalSection = () => (
        <div className={cardClass}>
            <div className={sectionHeaderClass}>
                <div className="flex items-center gap-3">
                    <FaUser className="text-indigo-500" />
                    <h3 className="text-lg font-bold">Personal Details</h3>
                </div>
                {editingSection !== "personal" && (
                    <button onClick={() => startEditing("personal")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 transition-all">
                        <FaEdit size={12} /> Edit
                    </button>
                )}
            </div>

            {editingSection === "personal" ? (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><FaUser /></div>
                                <input className={inputClass + " pl-10"} value={editPersonal.name} onChange={handlePersonalChange("name")} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><FaEnvelope /></div>
                                <input className={inputClass + " pl-10"} value={editPersonal.email} onChange={handlePersonalChange("email")} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Phone</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><FaPhone /></div>
                                <input className={inputClass + " pl-10"} placeholder="+1 (555) 123-4567" value={editPersonal.phone} onChange={handlePersonalChange("phone")} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Location</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><FaMapMarkerAlt /></div>
                                <input className={inputClass + " pl-10"} placeholder="City, State" value={editPersonal.location} onChange={handlePersonalChange("location")} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Date of Birth</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><FaCalendarAlt /></div>
                                <input type="date" className={inputClass + " pl-10"} value={editPersonal.dateOfBirth} onChange={handlePersonalChange("dateOfBirth")} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>LinkedIn</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><FaLinkedin /></div>
                                <input className={inputClass + " pl-10"} placeholder="https://linkedin.com/in/..." value={editPersonal.linkedIn} onChange={handlePersonalChange("linkedIn")} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>GitHub</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><FaGithub /></div>
                                <input className={inputClass + " pl-10"} placeholder="https://github.com/..." value={editPersonal.github} onChange={handlePersonalChange("github")} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Website</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><FaGlobe /></div>
                                <input className={inputClass + " pl-10"} placeholder="https://..." value={editPersonal.website} onChange={handlePersonalChange("website")} />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Bio / Summary</label>
                            <textarea className={inputClass + " min-h-[100px]"} placeholder="Write a short professional summary..." value={editPersonal.bio} onChange={handlePersonalChange("bio")} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <button onClick={savePersonal} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-60">
                            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
                        </button>
                        <button onClick={cancelEditing} disabled={saving} className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-all">
                            <FaTimes className="inline mr-1.5" /> Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {renderValue("Full Name", user?.name, <FaUser />)}
                    {renderValue("Email", user?.email, <FaEnvelope />)}
                    {renderValue("Phone", profile?.personalDetails?.phone, <FaPhone />)}
                    {renderValue("Location", profile?.personalDetails?.location, <FaMapMarkerAlt />)}
                    {renderValue("Date of Birth", profile?.personalDetails?.dateOfBirth ? formatDate(profile.personalDetails.dateOfBirth) : "", <FaCalendarAlt />)}
                    {renderValue("LinkedIn", profile?.personalDetails?.linkedIn, <FaLinkedin />)}
                    {renderValue("GitHub", profile?.personalDetails?.github, <FaGithub />)}
                    {renderValue("Website", profile?.personalDetails?.website, <FaGlobe />)}
                    {profile?.personalDetails?.bio && (
                        <div className="md:col-span-2">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 text-slate-400 dark:text-slate-500"><FaUser /></div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">Bio</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{profile.personalDetails.bio}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {!profile?.personalDetails?.phone && !profile?.personalDetails?.bio && !profile?.personalDetails?.location && (
                        <p className="text-sm text-slate-400 dark:text-slate-500 italic md:col-span-2">No additional details provided.</p>
                    )}
                </div>
            )}
        </div>
    );

    const renderSkillsSection = () => (
        <div className={cardClass}>
            <div className={sectionHeaderClass}>
                <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-indigo-500" />
                    <h3 className="text-lg font-bold">Skills</h3>
                </div>
                {editingSection !== "skills" && (
                    <button onClick={() => startEditing("skills")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 transition-all">
                        <FaEdit size={12} /> Edit
                    </button>
                )}
            </div>

            {editingSection === "skills" ? (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input className={inputClass + " flex-1"} placeholder="Type a skill and press Enter or Add" value={editSkillsInput} onChange={(e) => setEditSkillsInput(e.target.value)} onKeyDown={handleSkillKeyDown} />
                        <button type="button" onClick={addSkill} className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {editSkills.map((skill) => (
                            <span key={skill} className={badgeClass}>
                                {skill}
                                <button type="button" onClick={() => removeSkill(skill)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"><FaTrash size={10} /></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <button onClick={() => saveSection("skills")} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-60">
                            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
                        </button>
                        <button onClick={cancelEditing} disabled={saving} className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-all">
                            <FaTimes className="inline mr-1.5" /> Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    {profile?.skills?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill) => (
                                <span key={skill} className={badgeClass}>{skill}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 dark:text-slate-500 italic">No skills added yet.</p>
                    )}
                </div>
            )}
        </div>
    );

    const renderArraySection = (sectionKey, items, setter, fields, label, icon, emptyItem) => {
        const Icon = icon;
        const isEditing = editingSection === sectionKey;
        const displayItems = isEditing ? items : (profile?.[sectionKey === "experience" ? "workExperience" : sectionKey] || []);

        return (
            <div className={cardClass}>
                <div className={sectionHeaderClass}>
                    <div className="flex items-center gap-3">
                        <Icon className="text-indigo-500" />
                        <h3 className="text-lg font-bold">{label}</h3>
                    </div>
                    {!isEditing && (
                        <button onClick={() => startEditing(sectionKey)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 transition-all">
                            <FaEdit size={12} /> Edit
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {displayItems.length === 0 && !isEditing && (
                        <p className="text-sm text-slate-400 dark:text-slate-500 italic">No {label.toLowerCase()} added yet.</p>
                    )}

                    {displayItems.map((item, index) => (
                        <div key={index} className={`relative p-5 rounded-xl border ${isEditing ? "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30" : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"}`}>
                            {isEditing && (
                                <button type="button" onClick={() => removeArrayItem(setter, index)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                    <FaTrash size={12} />
                                </button>
                            )}
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {fields.map((f) => (
                                        <div key={f.key} className={f.fullWidth ? "md:col-span-2" : ""}>
                                            <label className={labelClass}>{f.label}</label>
                                            {f.type === "textarea" ? (
                                                <textarea className={inputClass + " min-h-[80px]"} placeholder={f.placeholder || ""} value={item[f.key] || ""} onChange={handleArrayFieldChange(setter, index, f.key)} />
                                            ) : f.type === "checkbox" ? (
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500" checked={!!item[f.key]} onChange={handleArrayFieldChange(setter, index, f.key)} />
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">I currently work here</span>
                                                </label>
                                            ) : f.type === "date" ? (
                                                <input type="date" className={inputClass} value={item[f.key] || ""} onChange={handleArrayFieldChange(setter, index, f.key)} />
                                            ) : (
                                                <input className={inputClass} placeholder={f.placeholder || ""} value={item[f.key] || ""} onChange={handleArrayFieldChange(setter, index, f.key)} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {item.institution || item.company || item.title || item.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {[item.degree, item.fieldOfStudy, item.title, item.issuer].filter(Boolean).join(" — ")}
                                    </p>
                                    {(item.startDate || item.endDate) && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            {item.startDate ? formatDate(item.startDate) : ""}
                                            {item.startDate && item.endDate ? " — " : ""}
                                            {item.endDate ? (item.current ? "Present" : formatDate(item.endDate)) : ""}
                                            {item.startDate && !item.endDate && !item.current ? " — Present" : ""}
                                        </p>
                                    )}
                                    {item.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>}
                                    {item.technologies?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {(Array.isArray(item.technologies) ? item.technologies : []).map((tech) => (
                                                <span key={tech} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">{tech}</span>
                                            ))}
                                        </div>
                                    )}
                                    {item.url && (
                                        <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400 hover:underline mt-1">
                                            View <FaExternalLinkAlt size={9} />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {isEditing && (
                        <>
                            <button type="button" onClick={() => addArrayItem(setter)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 transition-all text-sm font-medium">
                                <FaPlus /> Add {label.slice(0, -1)}
                            </button>
                            <div className="flex items-center gap-3 pt-2">
                                <button onClick={() => saveSection(sectionKey)} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-60">
                                    {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
                                </button>
                                <button onClick={cancelEditing} disabled={saving} className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-all">
                                    <FaTimes className="inline mr-1.5" /> Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

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

    const renderCompanySection = () => (
        <div className={cardClass}>
            <div className={sectionHeaderClass}>
                <div className="flex items-center gap-3">
                    <FaBuilding className="text-indigo-500" />
                    <h3 className="text-lg font-bold">Company Details</h3>
                </div>
            </div>
            <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900/50 shrink-0">
                        {company?.companyLogo ? (
                            <img src={company.companyLogo} alt={company.companyName} className="w-full h-full object-contain" />
                        ) : (
                            <FaBuilding className="text-2xl text-slate-500" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{company?.companyName || "Not registered"}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Registered Company</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                    {renderValue("Website", company?.websiteUrl, <FaGlobe />)}
                    {renderValue("Social Links", company?.socialLinks, <FaLink />)}
                    {renderValue("GST Number", company?.gstNumber, <FaBuilding />)}
                    {renderValue("UIN Number", company?.uinNumber, <FaBuilding />)}
                </div>
                <Link
                    to="/recruiter/company"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-all"
                >
                    <FaEdit size={12} /> Manage Company
                </Link>
            </div>
        </div>
    );

    const renderResumeSection = () => (
        <div className="md:col-span-2">
            <div className={cardClass}>
                <div className={sectionHeaderClass}>
                    <div className="flex items-center gap-3">
                        <FaFilePdf className="text-indigo-500" />
                        <h3 className="text-lg font-bold">Resume</h3>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 w-full">
                        {user?.resumeUrl ? (
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <FaFilePdf className="text-rose-500 text-2xl flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active PDF</p>
                                    <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-500 dark:text-indigo-400 hover:underline truncate block">View Resume</a>
                                </div>
                                <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
                            </div>
                        ) : (
                            <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                <FaCloudUploadAlt className="mx-auto text-3xl text-slate-500 dark:text-slate-400 mb-2" />
                                <p className="text-xs text-slate-500 dark:text-slate-400">No resume uploaded</p>
                            </div>
                        )}
                    </div>

                    <label className="w-full md:w-auto inline-flex items-center justify-center gap-2 cursor-pointer py-3 px-6 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        {uploading ? (
                            <><FaSpinner className="animate-spin text-sm" /> Uploading...</>
                        ) : (
                            <><FaCloudUploadAlt /> {user?.resumeUrl ? "Change Resume" : "Upload Resume"}</>
                        )}
                        <input type="file" accept="application/pdf" onChange={handleResumeUpload} className="hidden" disabled={uploading} />
                    </label>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">PDF document max 5MB. Your resume helps recruiters evaluate your profile.</p>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all your professional information in one place.</p>
                </div>

                {authRole === "recruiter" ? (
                    <>
                        {renderPersonalSection()}
                        {renderCompanySection()}
                    </>
                ) : (
                    <>
                        {!profile && (
                            <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    You haven't completed your profile yet.{' '}
                                    <a href="/onboarding" className="font-semibold underline hover:no-underline">Complete onboarding</a> to fill in your details.
                                </p>
                            </div>
                        )}

                        {renderPersonalSection()}
                        {renderSkillsSection()}
                        {renderArraySection("education", editEducation, setEditEducation, educationFields, "Education", FaGraduationCap, EMPTY_EDUCATION)}
                        {renderArraySection("experience", editExperience, setEditExperience, experienceFields, "Work Experience", FaBriefcase, EMPTY_EXPERIENCE)}
                        {renderArraySection("projects", editProjects, setEditProjects, projectFields, "Projects", FaProjectDiagram, EMPTY_PROJECT)}
                        {renderArraySection("certifications", editCertifications, setEditCertifications, certificationFields, "Certifications", FaCertificate, EMPTY_CERTIFICATION)}

                        {user?.role === "job_seeker" && renderResumeSection()}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;
