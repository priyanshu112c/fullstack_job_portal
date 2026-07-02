import { useState } from "react";
import { FaBars } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 md:px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            aria-label="Open sidebar menu"
                        >
                            <FaBars className="text-lg" />
                        </button>
                        <h2 className="text-lg font-semibold tracking-tight">Portal</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
