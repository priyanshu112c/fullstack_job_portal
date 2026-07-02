import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { logoutUser } from "../services/authService";
import {
    FaColumns,
    FaSearch,
    FaBriefcase,
    FaRobot,
    FaComments,
    FaUser,
    FaPlusCircle,
    FaUsers,
    FaUserCog,
    FaSignOutAlt,
    FaHistory,
    FaBuilding,
    FaTimes
} from "react-icons/fa";
import toast from "react-hot-toast";

const Sidebar = ({ isOpen, onClose }) => {
    const role = useSelector((state) => state?.auth?.role);
    const user = useSelector((state) => state?.auth?.user);
    const hasCompany = useSelector((state) => state?.auth?.hasCompany);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUser();
            dispatch(logout());
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err);
            toast.error("Logout failed");
        }
    };

    let links = [];

    if (role === "admin") {
        links = [
            { to: "/admin", label: "Dashboard", icon: <FaColumns /> },
            { to: "/admin/users", label: "Manage Users", icon: <FaUsers /> },
            { to: "/admin/jobs", label: "Manage Jobs", icon: <FaUserCog /> },
            { to: "/admin/conversations", label: "Manage Conversations", icon: <FaComments /> },
            { to: "/admin/audit-logs", label: "Audit Logs", icon: <FaHistory /> },
            { to: "/profile", label: "Profile", icon: <FaUser /> },
        ];
    } else if (role === "recruiter") {
        links = [
            { to: "/recruiter", label: "Dashboard", icon: <FaColumns /> },
            { to: "/recruiter/company", label: "My Company", icon: <FaBuilding /> },
            ...(hasCompany ? [
                { to: "/recruiter/jobs", label: "Manage Jobs", icon: <FaBriefcase /> },
                { to: "/recruiter/jobs/new", label: "Post a Job", icon: <FaPlusCircle /> },
                { to: "/recruiter/applications", label: "Manage Applications", icon: <FaUsers /> },
            ] : []),
            { to: "/messages", label: "Messages", icon: <FaComments /> },
            { to: "/profile", label: "Profile", icon: <FaUser /> },
        ];
    } else {
        links = [
            { to: "/dashboard/job-seeker", label: "Dashboard", icon: <FaColumns /> },
            { to: "/jobs", label: "Search Jobs", icon: <FaSearch /> },
            { to: "/applications", label: "My Applications", icon: <FaBriefcase /> },
            { to: "/resume-analyzer", label: "Resume Analyzer", icon: <FaRobot /> },
            { to: "/messages", label: "Messages", icon: <FaComments /> },
            { to: "/profile", label: "Profile", icon: <FaUser /> },
        ];
    }

    const navContent = (
        <>
            <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                            AIGravity Portal
                        </div>
                        <div className="mt-1.5 text-xs text-slate-400 font-medium">
                            {user?.name ? `${user.name} (${role})` : "Portal Access"}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        aria-label="Close sidebar"
                    >
                        <FaTimes />
                    </button>
                </div>
            </div>

            <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
                {links.map((l) => (
                    <NavLink
                        key={l.to}
                        to={l.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                            }`
                        }
                    >
                        <span className="text-base">{l.icon}</span>
                        <span>{l.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => { handleLogout(); onClose?.(); }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
                >
                    <FaSignOutAlt className="text-base" />
                    <span>Sign Out</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Mobile drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {navContent}
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex shrink-0">
                {navContent}
            </aside>
        </>
    );
};

export default Sidebar;
