import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { setCompany } from "../redux/slices/authSlice";
import { registerCompany } from "../services/companyService";
import DashboardLayout from "../layouts/DashboardLayout";
import toast from "react-hot-toast";
import { FaSpinner, FaBuilding } from "react-icons/fa";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const schema = z.object({
    companyName: z.string().min(2, "Company name must be at least 2 characters").nonempty("Company name is required"),
    websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    socialLinks: z.string().optional().or(z.literal("")),
    gstNumber: z.string().optional().or(z.literal("")),
    uinNumber: z.string().optional().or(z.literal("")),
});

const CompanyRegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { role } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    if (role !== "recruiter") {
        navigate("/");
        return null;
    }

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                toast.error("Only JPEG, PNG, WebP, and GIF images are allowed");
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                toast.error("File size must be less than 5MB");
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("companyName", data.companyName);
            formData.append("websiteUrl", data.websiteUrl || "");
            formData.append("socialLinks", data.socialLinks || "");
            formData.append("gstNumber", data.gstNumber || "");
            formData.append("uinNumber", data.uinNumber || "");
            if (logoFile) {
                formData.append("companyLogo", logoFile);
            }

            const res = await registerCompany(formData);
            if (res.data?.success) {
                dispatch(setCompany(res.data.company));
                toast.success("Company profile created successfully!");
                navigate("/recruiter");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create company profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-2xl mx-auto">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 mb-4">
                        <FaBuilding className="text-2xl text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Register Your Company</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        You must register your company before you can post jobs or access dashboard features.
                    </p>
                </div>

                <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900/50">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-xs text-slate-500 text-center px-2">Company Logo</span>
                                )}
                            </div>
                            <label className="mt-3 cursor-pointer text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                                Upload Logo (JPEG, PNG, WebP, GIF)
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Company Name *</label>
                            <input
                                {...register("companyName")}
                                type="text"
                                className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                placeholder="Acme Corp"
                            />
                            {errors.companyName && <p className="mt-1 text-xs text-rose-500">{errors.companyName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Website URL</label>
                            <input
                                {...register("websiteUrl")}
                                type="text"
                                className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                placeholder="https://acmecorp.com"
                            />
                            {errors.websiteUrl && <p className="mt-1 text-xs text-rose-500">{errors.websiteUrl.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Social Media Links</label>
                            <input
                                {...register("socialLinks")}
                                type="text"
                                className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                placeholder="https://linkedin.com/company/acme"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">GST Number</label>
                                <input
                                    {...register("gstNumber")}
                                    type="text"
                                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                    placeholder="GSTIN"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">UIN Number</label>
                                <input
                                    {...register("uinNumber")}
                                    type="text"
                                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                    placeholder="UIN"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60"
                                disabled={loading}
                            >
                                {loading ? <FaSpinner className="animate-spin text-sm" /> : "Register Company"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CompanyRegisterPage;
