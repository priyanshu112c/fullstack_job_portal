import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { FaLock, FaRobot, FaSpinner, FaArrowLeft } from "react-icons/fa";
import ThemeToggle from "../components/ThemeToggle";

const schema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success("Password reset successfully! Please log in.");
            navigate("/login");
        } catch (error) {
            toast.error("Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="absolute top-4 right-4 z-20">
                <ThemeToggle />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
                <Link to="/" className="inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">
                    <FaRobot className="text-indigo-600 dark:text-indigo-400" />
                    <span>AIGravity</span>
                </Link>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create New Password</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Please choose a strong, unique password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <FaLock />
                                </div>
                                <input
                                    {...register("password")}
                                    type="password"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <FaLock />
                                </div>
                                <input
                                    {...register("confirmPassword")}
                                    type="password"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                            {errors.confirmPassword && <p className="mt-1.5 text-xs text-rose-500">{errors.confirmPassword.message}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? <FaSpinner className="animate-spin text-sm" /> : "Reset Password"}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                                <FaArrowLeft /> Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
