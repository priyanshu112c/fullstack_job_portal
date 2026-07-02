import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

const AuthTopNav = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        // Browser/history back navigation with safe fallback
        if (window.history.length > 1) navigate(-1);
        else navigate("/");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-colors"
                        whileHover={{ y: -1, boxShadow: "0px 0px 18px rgba(99,102,241,0.25)" }}
                        whileTap={{ scale: 0.98 }}
                        aria-label="Go back"
                    >
                        <span aria-hidden="true" className="text-base font-bold">
                            ←
                        </span>
                    </motion.button>

                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400"
                    >
                        <FaRobot className="text-indigo-600 dark:text-indigo-400" />
                        <span className="hidden sm:inline">AIGravity</span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />
                    <motion.div
                        className="hidden sm:block"
                        whileHover={{ y: -1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-4 h-10 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
                        >
                            Home
                        </Link>
                    </motion.div>

                    <motion.div
                        className="sm:hidden"
                        whileHover={{ y: -1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-3 h-10 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900/40 hover:bg-slate-200 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-300 dark:border-slate-800 transition-colors"
                        >
                            Home
                        </Link>
                    </motion.div>
                </div>
            </div>
        </nav>
    );
};

export default AuthTopNav;
