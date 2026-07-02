import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaSearch, FaSpinner, FaHistory, FaUser, FaLock, FaTrash, FaComment, FaUnlock, FaFlag, FaTrashAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const ACTION_ICONS = {
    user_blocked: <FaLock className="text-rose-600 dark:text-rose-400" />,
    user_unblocked: <FaUnlock className="text-emerald-600 dark:text-emerald-400" />,
    message_deleted: <FaTrash className="text-amber-600 dark:text-amber-400" />,
    conversation_locked: <FaLock className="text-rose-600 dark:text-rose-400" />,
    conversation_unlocked: <FaUnlock className="text-emerald-600 dark:text-emerald-400" />,
    admin_message_sent: <FaComment className="text-indigo-600 dark:text-indigo-400" />,
    conversation_archived: <FaHistory className="text-slate-500 dark:text-slate-400" />,
    conversation_flagged: <FaFlag className="text-amber-600 dark:text-amber-400" />,
    audit_logs_deleted: <FaTrashAlt className="text-rose-600 dark:text-rose-400" />
};

const ACTION_LABELS = {
    user_blocked: "User Blocked",
    user_unblocked: "User Unblocked",
    message_deleted: "Message Deleted",
    conversation_locked: "Conversation Locked",
    conversation_unlocked: "Conversation Unlocked",
    admin_message_sent: "Admin Message Sent",
    conversation_archived: "Conversation Archived",
    conversation_flagged: "Conversation Flagged",
    audit_logs_deleted: "Audit Logs Deleted"
};

const AdminAuditLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const loadAuditLogs = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/audit-logs");
            if (res.data && res.data.success) {
                setLogs(res.data.logs || []);
            }
        } catch (err) {
            console.error("Error loading audit logs:", err);
            toast.error(err.response?.data?.message || "Failed to load audit logs");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("Are you sure you want to delete all audit logs? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await api.delete("/admin/audit-logs");
            if (res.data && res.data.success) {
                toast.success(`Deleted ${res.data.deletedCount} audit logs`);
                setLogs([]);
            }
        } catch (err) {
            console.error("Error deleting audit logs:", err);
            toast.error(err.response?.data?.message || "Failed to delete audit logs");
        }
    };

    useEffect(() => {
        loadAuditLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        if (!searchQuery.trim()) return logs;

        const q = searchQuery.toLowerCase();
        return logs.filter(log =>
            (log.adminId?.name || "").toLowerCase().includes(q) ||
            (log.adminId?.email || "").toLowerCase().includes(q) ||
            (log.targetUserId?.name || "").toLowerCase().includes(q) ||
            (log.targetUserId?.email || "").toLowerCase().includes(q) ||
            (log.action || "").toLowerCase().includes(q)
        );
    }, [logs, searchQuery]);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track all admin actions across the platform.</p>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-center flex-wrap">
                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by admin or user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                        />
                    </div>
                    <button
                        onClick={handleDeleteAll}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <FaTrashAlt className="text-xs" />
                        Delete All Logs
                    </button>
                </div>

                {/* Table */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-slate-500">
                            <FaSpinner className="animate-spin mr-3" /> Loading audit logs...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                                        <th className="py-3 px-4">Action</th>
                                        <th className="py-3 px-4">Admin</th>
                                        <th className="py-3 px-4">Target User</th>
                                        <th className="py-3 px-4">Conversation</th>
                                        <th className="py-3 px-4">Timestamp</th>
                                        <th className="py-3 px-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <tr
                                            key={log._id}
                                            className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    {ACTION_ICONS[log.action] || <FaHistory className="text-slate-400" />}
                                                    <span className="font-semibold text-slate-800 dark:text-white">
                                                        {ACTION_LABELS[log.action] || log.action}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-800 dark:text-white">
                                                {log.adminId?.name || "—"}
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{log.adminId?.email || ""}</div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-800 dark:text-white">
                                                {log.targetUserId?.name || "—"}
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{log.targetUserId?.email || ""}</div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs truncate max-w-[120px]">
                                                {log.conversationId || "—"}
                                            </td>
                                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                                                {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                                            </td>
                                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-xs max-w-xs truncate">
                                                {log.metadata?.reason || log.metadata?.content || "—"}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400 italic">
                                                No audit logs found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminAuditLogsPage;