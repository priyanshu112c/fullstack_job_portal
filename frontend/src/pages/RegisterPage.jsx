import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { registerUser } from "../services/authService";
import { FaUser, FaEnvelope, FaLock, FaRobot, FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";
import AuthTopNav from "../components/AuthTopNav";

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").nonempty("Name is required"),
    email: z.string().email("Invalid email format").nonempty("Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["job_seeker", "recruiter"], {
        errorMap: () => ({ message: "Please select your profile role" }),
    }),
});

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            role: "job_seeker",
        },
    });

    const selectedRole = watch("role");

    const handleRegister = async (data) => {
        setLoading(true);
        try {
            const response = await registerUser(data);
            if (response.data && response.data.success) {
                toast.success("Account created successfully! Please sign in.");
                navigate("/login");
            } else {
                toast.error(response.data?.message || "Registration failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            <AuthTopNav />

            {/* Background glows */}
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center pt-20 sm:pt-22">
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create your account</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Already have an account?{" "}
                    <motion.span
                        whileHover={{ y: -1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="inline-block"
                    >
                        <Link
                            to="/login"
                            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                        >
                            Login
                        </Link>
                    </motion.span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
                    <form className="space-y-5" onSubmit={handleSubmit(handleRegister)}>
                        {/* Name field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <FaUser />
                                </div>
                                <input
                                    {...register("name")}
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                                    placeholder="John Doe"
                                    disabled={loading}
                                />
                            </div>
                            {errors.name && <p className="mt-1.5 text-xs text-rose-500">{errors.name.message}</p>}
                        </div>

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
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
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

                        {/* Role selection tab button system */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I want to register as a</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setValue("role", "job_seeker")}
                                    className={`py-3 px-4 border rounded-xl text-sm font-semibold transition-all ${selectedRole === "job_seeker"
                                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-white shadow-md shadow-indigo-500/5"
                                        : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                    disabled={loading}
                                >
                                    Job Seeker
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setValue("role", "recruiter")}
                                    className={`py-3 px-4 border rounded-xl text-sm font-semibold transition-all ${selectedRole === "recruiter"
                                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-white shadow-md shadow-indigo-500/5"
                                        : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                    disabled={loading}
                                >
                                    Recruiter
                                </button>
                            </div>
                            {errors.role && <p className="mt-1.5 text-xs text-rose-500">{errors.role.message}</p>}
                        </div>

                        {/* Register Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? <FaSpinner className="animate-spin text-sm" /> : "Sign Up"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
