import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../api/axios";
import { getMyCompany } from "../services/companyService";
import DashboardLayout from "../layouts/DashboardLayout";
import toast from "react-hot-toast";
import { FaSpinner, FaArrowLeft } from "react-icons/fa";

const schema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").nonempty("Title is required"),
    company: z.string().min(2, "Company name is required").nonempty(),
    location: z.string().min(2, "Location is required").nonempty(),
    salaryMin: z.preprocess((val) => Number(val), z.number().min(0, "Salary min must be positive")),
    salaryMax: z.preprocess((val) => Number(val), z.number().min(0, "Salary max must be positive")),
    employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
    description: z.string().min(10, "Description must be at least 10 characters").nonempty(),
    skills: z.string().min(2, "Skills are required").nonempty(),
});

const CreateJobPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [companyData, setCompanyData] = useState(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            company: "",
            employmentType: "full-time",
        }
    });

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await getMyCompany();
                if (res.data?.success && res.data?.company) {
                    const c = res.data.company;
                    setCompanyData(c);
                    setValue("company", c.companyName);
                } else {
                    toast.error("You must register your company first");
                    navigate("/recruiter/company/register");
                }
            } catch {
                toast.error("Failed to load company profile");
                navigate("/recruiter/jobs");
            } finally {
                setPageLoading(false);
            }
        };
        fetchCompany();
    }, [setValue, navigate]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const skillsArray = data.skills.split(",").map((s) => s.trim()).filter((s) => s !== "");
            const payload = {
                ...data,
                skills: skillsArray,
            };

            const res = await api.post("/jobs/create-job", payload);
            if (res.data && res.data.success) {
                toast.success("Job posting created successfully!");
                navigate("/recruiter/jobs");
            }
        } catch (err) {
            console.error("Error creating job:", err);
            toast.error(err.response?.data?.message || "Failed to create job posting");
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <FaSpinner className="animate-spin text-3xl text-indigo-600 dark:text-indigo-400" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-3xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link to="/recruiter/jobs" className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Job Posting</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Publish new roles to the AIGravity portal.</p>
                    </div>
                </div>

                <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
                    {companyData?.companyLogo && (
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="w-12 h-12 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900/50 shrink-0">
                                <img src={companyData.companyLogo} alt={companyData.companyName} className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Posting under</p>
                                <p className="text-lg font-bold">{companyData.companyName}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title and Company */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Job Title</label>
                                <input
                                    {...register("title")}
                                    type="text"
                                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                    placeholder="Software Engineer"
                                />
                                {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Company Name</label>
                                <input
                                    {...register("company")}
                                    type="text"
                                    disabled
                                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Location and Type */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Location</label>
                                <input
                                    {...register("location")}
                                    type="text"
                                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                    placeholder="San Francisco, CA / Remote"
                                />
                                {errors.location && <p className="mt-1 text-xs text-rose-500">{errors.location.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Employment Type</label>
                                <select
                                    {...register("employmentType")}
                                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                >
                                    <option value="full-time">Full-Time</option>
                                    <option value="part-time">Part-Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                </select>
                                {errors.employmentType && <p className="mt-1 text-xs text-rose-500">{errors.employmentType.message}</p>}
                            </div>
                        </div>

                        {/* Salary Min and Salary Max */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Minimum Salary (in thousands, e.g. 80 for $80k)</label>
                                <input
                                    {...register("salaryMin")}
                                    type="number"
                                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                    placeholder="80"
                                />
                                {errors.salaryMin && <p className="mt-1 text-xs text-rose-500">{errors.salaryMin.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Maximum Salary (in thousands, e.g. 120 for $120k)</label>
                                <input
                                    {...register("salaryMax")}
                                    type="number"
                                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                    placeholder="120"
                                />
                                {errors.salaryMax && <p className="mt-1 text-xs text-rose-500">{errors.salaryMax.message}</p>}
                            </div>
                        </div>

                        {/* Required Skills */}
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Required Skills (separated by commas)</label>
                            <input
                                {...register("skills")}
                                type="text"
                                className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                placeholder="React, Node.js, JavaScript, MongoDB"
                            />
                            {errors.skills && <p className="mt-1 text-xs text-rose-500">{errors.skills.message}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Job Description</label>
                            <textarea
                                {...register("description")}
                                rows="6"
                                className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                placeholder="Describe the role, responsibilities, and qualifications..."
                            />
                            {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60"
                                disabled={loading}
                            >
                                {loading ? <FaSpinner className="animate-spin text-sm" /> : "Publish Job"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateJobPage;
