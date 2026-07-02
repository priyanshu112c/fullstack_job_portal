import { useEffect, useState } from "react";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { 
    FaSearch, 
    FaUserShield, 
    FaTrashAlt, 
    FaUserEdit, 
    FaSpinner 
} from "react-icons/fa";
import toast from "react-hot-toast";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);

    const loadUsers = async () => {
        try {
            const res = await api.get("/admin/users");
            if (res.data && res.data.success) {
                setUsers(res.data.users || []);
                setFilteredUsers(res.data.users || []);
            }
        } catch (err) {
            console.error("Error loading users list:", err);
            toast.error("Failed to load users list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Filter list based on search query
    useEffect(() => {
        const query = searchQuery.toLowerCase().trim();
        if (query === "") {
            setFilteredUsers(users);
        } else {
            setFilteredUsers(
                users.filter(u => 
                    u.name?.toLowerCase().includes(query) ||
                    u.email?.toLowerCase().includes(query) ||
                    u.role?.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, users]);

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingUserId(userId);
        try {
            const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
            if (res.data && res.data.success) {
                setUsers(prev => 
                    prev.map(u => u._id === userId ? { ...u, role: newRole } : u)
                );
                toast.success("User role updated successfully!");
            }
        } catch (err) {
            console.error("Error changing role:", err);
            toast.error(err.response?.data?.message || "Failed to update role");
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
        
        setDeletingUserId(userId);
        try {
            const res = await api.delete(`/admin/users/${userId}`);
            if (res.data && res.data.success) {
                setUsers(prev => prev.filter(u => u._id !== userId));
                toast.success("User account deleted successfully");
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            toast.error(err.response?.data?.message || "Failed to delete user");
        } finally {
            setDeletingUserId(null);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Administration</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit accounts, modify authorization rules, or remove user data profiles.</p>
                </div>

                {/* Search Board */}
                <div className="flex gap-4 items-center bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Search user name, email, role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                                    <th className="py-3 px-4">Member Name</th>
                                    <th className="py-3 px-4">Email Address</th>
                                    <th className="py-3 px-4">Active Role</th>
                                    <th className="py-3 px-4">Registered Date</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                        <td className="py-4 px-4 font-semibold text-slate-800 dark:text-white">{u.name}</td>
                                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                                        <td className="py-4 px-4">
                                            <div className="relative inline-block w-40">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                    disabled={updatingUserId === u._id}
                                                    className="w-full bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-200 capitalize font-semibold cursor-pointer"
                                                >
                                                    <option value="job_seeker">Job Seeker</option>
                                                    <option value="recruiter">Recruiter</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                {updatingUserId === u._id && (
                                                    <span className="absolute right-6 top-2 text-[10px] text-indigo-600 dark:text-indigo-400 animate-spin">
                                                        <FaSpinner />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                disabled={deletingUserId === u._id}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/15 rounded-xl border border-rose-500/20 transition-all cursor-pointer"
                                            >
                                                {deletingUserId === u._id ? (
                                                    <FaSpinner className="animate-spin" />
                                                ) : (
                                                    <FaTrashAlt />
                                                )}
                                                <span>Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-slate-500 italic">No matches found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminUsersPage;
