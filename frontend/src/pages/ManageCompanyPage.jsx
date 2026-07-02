import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSelector, useDispatch } from "react-redux";
import { setCompany, clearCompany } from "../redux/slices/authSlice";
import { getMyCompany, updateCompany, deleteCompany } from "../services/companyService";
import DashboardLayout from "../layouts/DashboardLayout";
import toast from "react-hot-toast";
import { FaSpinner, FaEdit, FaTrash, FaBuilding, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const schema = z.object({
    companyName: z.string().min(2, "Company name must be at least 2 characters").nonempty("Company name is required"),
    websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    socialLinks: z.string().optional().or(z.literal("")),
    gstNumber: z.string().optional().or(z.literal("")),
    uinNumber: z.string().optional().or(z.literal("")),
});

const ManageCompanyPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { company: reduxCompany, role } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [company, setLocalCompany] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                if (reduxCompany) {
                    setLocalCompany(reduxCompany);
                    reset({
                        companyName: reduxCompany.companyName,
                        websiteUrl: reduxCompany.websiteUrl || "",
                        socialLinks: reduxCompany.socialLinks || "",
                        gstNumber: reduxCompany.gstNumber || "",
                        uinNumber: reduxCompany.uinNumber || "",
                    });
                    if (reduxCompany.companyLogo) {
                        setLogoPreview(reduxCompany.companyLogo);
                    }
                } else {
                    const res = await getMyCompany();
                    if (res.data?.success && res.data?.company) {
                        const c = res.data.company;
                        setLocalCompany(c);
                        dispatch(setCompany(c));
                        reset({
                            companyName: c.companyName,
                            websiteUrl: c.websiteUrl || "",
                            socialLinks: c.socialLinks || "",
                            gstNumber: c.gstNumber || "",
                            uinNumber: c.uinNumber || "",
                        });
                        if (c.companyLogo) {
                            setLogoPreview(c.companyLogo);
                        }
                    } else {
                        navigate("/recruiter/company/register");
                    }
                }
            } catch {
                toast.error("Failed to load company profile");
                navigate("/recruiter");
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [reduxCompany, reset, navigate, dispatch]);

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
        setSaving(true);
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

            const res = await updateCompany(formData);
            if (res.data?.success) {
                dispatch(setCompany(res.data.company));
                setLocalCompany(res.data.company);
                toast.success("Company profile updated successfully!");
                setEditing(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update company profile");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete your company profile? This will not delete your jobs but company info will be removed.")) return;

        setDeleting(true);
        try {
            const res = await deleteCompany();
            if (res.data?.success) {
                dispatch(clearCompany());
                toast.success("Company profile deleted successfully");
                navigate("/recruiter/company/register");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete company profile");
        } finally {
            setDeleting(false);
        }
    };

    if (role !== "recruiter") {
        navigate("/");
        return null;
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <FaSpinner className="animate-spin text-3xl text-indigo-400" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link to="/recruiter" className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Company</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and manage your registered company profile.</p>
                    </div>
                </div>

                <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
                    {!editing ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="w-20 h-20 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900/50 shrink-0">
                                    {company?.companyLogo ? (
                                        <img src={company.companyLogo} alt={company.companyName} className="w-full h-full object-contain" />
                                    ) : (
                                        <FaBuilding className="text-2xl text-slate-500 dark:text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{company?.companyName}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Registered Company</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">Website</span>
                                    <p className="font-medium mt-0.5">{company?.websiteUrl || "Not provided"}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">Social Links</span>
                                    <p className="font-medium mt-0.5">{company?.socialLinks || "Not provided"}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">GST Number</span>
                                    <p className="font-medium mt-0.5">{company?.gstNumber || "Not provided"}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">UIN Number</span>
                                    <p className="font-medium mt-0.5">{company?.uinNumber || "Not provided"}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setEditing(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-all"
                                >
                                    <FaEdit /> Edit Company
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-600/30 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 transition-all disabled:opacity-60"
                                >
                                    {deleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                                    Delete Company
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900/50">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-xs text-slate-500 dark:text-slate-400 text-center px-2">Company Logo</span>
                                    )}
                                </div>
                                <label className="mt-3 cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                                    Change Logo
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
                                />
                                {errors.companyName && <p className="mt-1 text-xs text-rose-500">{errors.companyName.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Website URL</label>
                                <input
                                    {...register("websiteUrl")}
                                    type="text"
                                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                />
                                {errors.websiteUrl && <p className="mt-1 text-xs text-rose-500">{errors.websiteUrl.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Social Media Links</label>
                                <input
                                    {...register("socialLinks")}
                                    type="text"
                                    className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">GST Number</label>
                                    <input
                                        {...register("gstNumber")}
                                        type="text"
                                        className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">UIN Number</label>
                                    <input
                                        {...register("uinNumber")}
                                        type="text"
                                        className="mt-1.5 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                                >
                                    {saving ? <FaSpinner className="animate-spin" /> : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false);
                                        reset({
                                            companyName: company?.companyName,
                                            websiteUrl: company?.websiteUrl || "",
                                            socialLinks: company?.socialLinks || "",
                                            gstNumber: company?.gstNumber || "",
                                            uinNumber: company?.uinNumber || "",
                                        });
                                        setLogoPreview(company?.companyLogo || null);
                                        setLogoFile(null);
                                    }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white rounded-xl text-sm font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManageCompanyPage;
