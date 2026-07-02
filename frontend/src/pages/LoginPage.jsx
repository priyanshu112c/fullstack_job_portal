import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { setCredentials } from "../redux/slices/authSlice";
import { loginUser } from "../services/authService";
import { FaLock, FaEnvelope, FaRobot, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";
import AuthTopNav from "../components/AuthTopNav";

const schema = z.object({
    email: z.string().email("Invalid email format").nonempty("Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const handleLogin = async (data) => {
        setLoading(true);
        try {
            const response = await loginUser(data);
            if (response.data && response.data.success) {
                const { accessToken, role, user, hasCompany, onboardingCompleted } = response.data;

                dispatch(
                    setCredentials({
                        user,
                        accessToken,
                        role,
                        hasCompany,
                        onboardingCompleted,
                    })
                );

                toast.success("Welcome back!");

                // Redirect based on role
                if (role === "admin") {
                    navigate("/admin");
                } else if (role === "recruiter") {
                    navigate("/recruiter");
                } else if (role === "job_seeker" && !onboardingCompleted) {
                    navigate("/onboarding");
                } else {
                    navigate("/dashboard");
                }
            } else {
                toast.error(response.data?.message || "Login failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            <AuthTopNav />

            {/* Background blur effects */}
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center pt-20 sm:pt-22">
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in to your account</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Don&apos;t have an account?{" "}
                    <motion.span
                        whileHover={{ y: -1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="inline-block"
                    >
                        <Link
                            to="/register"
                            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                        >
                            Register
                        </Link>
                    </motion.span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(handleLogin)}>
                        {/* Email field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <FaEnvelope />
                                </div>
                                <input
                                    {...register("email")}
                                    type="email"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-rose-500">{errors.email.message}</p>}
                        </div>

                        {/* Password field */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
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

                        {/* Login Button */}
                        <div>
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? <FaSpinner className="animate-spin text-sm" /> : "Sign In"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
