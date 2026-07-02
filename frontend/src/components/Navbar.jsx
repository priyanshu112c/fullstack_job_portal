import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaBars, FaTimes } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
    { to: "/jobs", label: "Find Jobs" },
    { to: "/login", label: "Sign In" },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
                <Link
                    to="/"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 flex items-center gap-2"
                >
                    <FaRobot className="text-indigo-600 dark:text-indigo-400" />
                    <span>AIGravity</span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <ThemeToggle />
                    <Link
                        to="/register"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-600/30"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <div className="flex md:hidden items-center gap-3">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                    >
                        {isOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 top-[73px] bg-black/40 md:hidden"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md md:hidden"
                        >
                            <div className="px-4 sm:px-6 py-4 space-y-3">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setIsOpen(false)}
                                        className="block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <Link
                                    to="/register"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-600/30"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
