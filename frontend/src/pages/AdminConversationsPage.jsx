import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { FaSearch, FaSpinner, FaComments, FaLock, FaUnlock, FaTrash, FaExclamationTriangle, FaSync, FaUserCircle, FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminConversationsPage = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedThread, setSelectedThread] = useState(null);
    const [threadMessages, setThreadMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [adminMessage, setAdminMessage] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingConversation, setDeletingConversation] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [emailFilter, setEmailFilter] = useState("");
    const [userIdFilter, setUserIdFilter] = useState("");

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const selectedThreadRef = useRef(null);

    selectedThreadRef.current = selectedThread;

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        const socketHost = import.meta.env.VITE_API_URL.replace("/api/v1", "");
        const socket = io(socketHost, { withCredentials: true });
        socketRef.current = socket;

        if (user?._id) {
            socket.emit("join", user._id);
        }

        const conversationDeletedHandler = ({ conversationKey }) => {
            setConversations(prev => prev.filter(c => c.conversationId !== conversationKey));
            if (selectedThreadRef.current?.conversationId === conversationKey) {
                setThreadMessages([]);
                setSelectedThread(null);
            }
        };

        socket.on("conversation_deleted", conversationDeletedHandler);

        return () => {
            socket.off("conversation_deleted", conversationDeletedHandler);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user?._id]);

    const queryParams = useMemo(() => {
        const q = searchQuery.trim();
        return {
            name: q || undefined,
            email: emailFilter.trim() || undefined,
            role: roleFilter || undefined,
            userId: userIdFilter.trim() || undefined
        };
    }, [searchQuery, emailFilter, roleFilter, userIdFilter]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/conversations", { params: queryParams });
            if (res.data && res.data.success) {
                setConversations(res.data.conversations || []);
            }
        } catch (err) {
            console.error("Error loading admin conversations:", err);
            toast.error(err.response?.data?.message || "Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            loadConversations();
        }, 450);
        return () => clearTimeout(t);
    }, [queryParams.name, queryParams.email, queryParams.role, queryParams.userId]);

    const loadThreadMessages = useCallback(async (conversationKey) => {
        if (!conversationKey) return;
        try {
            setLoadingMessages(true);
            const res = await api.get(`/admin/conversations/${conversationKey}`);
            if (res.data && res.data.success) {
                setThreadMessages(res.data.messages || []);
            }
        } catch (err) {
            console.error("Error loading thread messages:", err);
            toast.error("Failed to load messages");
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [threadMessages]);

    const handleThreadSelect = (thread) => {
        setSelectedThread(thread);
        setThreadMessages([]);
        loadThreadMessages(thread.conversationId);
    };

    const handleLockConversation = async (conversationId, isLocked) => {
        setActionLoading(true);
        try {
            const res = await api.put(`/admin/conversations/${conversationId}/lock`, { isLocked: !isLocked });
            if (res.data?.success) {
                toast.success(`Conversation ${isLocked ? "unlocked" : "locked"} successfully`);
                loadConversations();
                if (selectedThread?.conversationId === conversationId) {
                    setSelectedThread(prev => ({ ...prev, isLocked: !isLocked }));
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteConversation = async () => {
        if (!selectedThread?.conversationId) return;
        setDeletingConversation(true);
        const conversationId = selectedThread.conversationId;
        try {
            setConversations(prev => prev.filter(c => c.conversationId !== conversationId));
            setThreadMessages([]);
            setSelectedThread(null);
            const res = await api.delete(`/admin/conversations/${conversationId}`);
            if (res.data?.success) {
                toast.success("Conversation deleted");
            } else {
                loadConversations();
            }
        } catch (err) {
            loadConversations();
            toast.error(err.response?.data?.message || "Failed to delete conversation");
        } finally {
            setDeletingConversation(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleDeleteConversationFromList = async (conversationId, e) => {
        e.stopPropagation();
        setDeletingConversation(true);
        try {
            setConversations(prev => prev.filter(c => c.conversationId !== conversationId));
            if (selectedThread?.conversationId === conversationId) {
                setThreadMessages([]);
                setSelectedThread(null);
            }
            const res = await api.delete(`/admin/conversations/${conversationId}`);
            if (res.data?.success) {
                toast.success("Conversation deleted");
            } else {
                loadConversations();
            }
        } catch (err) {
            loadConversations();
            toast.error(err.response?.data?.message || "Failed to delete conversation");
        } finally {
            setDeletingConversation(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        setActionLoading(true);
        try {
            const res = await api.delete(`/admin/messages/${messageId}`);
            if (res.data?.success) {
                toast.success("Message deleted");
                setThreadMessages(prev => prev.filter(m => m._id !== messageId));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendAdminMessage = async (e) => {
        e.preventDefault();
        if (!adminMessage.trim() || !selectedThread) return;

        setActionLoading(true);
        try {
            const res = await api.post(`/admin/conversations/${selectedThread.conversationId}/messages`, {
                content: adminMessage.trim()
            });
            if (res.data?.success) {
                setThreadMessages(prev => [...prev, res.data.message]);
                setAdminMessage("");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send message");
        } finally {
            setActionLoading(false);
        }
    };

    const handleWarnUser = async (userId, conversationId) => {
        if (!adminMessage.trim()) {
            toast.error("Enter warning message");
            return;
        }

        try {
            const res = await api.post(`/admin/conversations/${conversationId}/messages`, {
                content: adminMessage.trim()
            });
            if (res.data?.success) {
                toast.success("Warning sent");
                setAdminMessage("");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send warning");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Conversations</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor and moderate all conversations on the platform.</p>
                </div>

                <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
                    <div className="flex gap-4 items-center flex-wrap">
                        <div className="relative w-full md:w-80">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">
                                <FaSearch />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by user name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                            />
                        </div>

                        <button
                            onClick={() => loadConversations()}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <FaSync className="text-xs" />
                            Refresh
                        </button>

                        <div className="w-full md:w-60">
                            <input
                                type="text"
                                placeholder="Email"
                                value={emailFilter}
                                onChange={(e) => setEmailFilter(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                            />
                        </div>

                        <div className="w-full md:w-56">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All roles</option>
                                <option value="job_seeker">Job Seeker</option>
                                <option value="recruiter">Recruiter</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="w-full md:w-72">
                            <input
                                type="text"
                                placeholder="UserId"
                                value={userIdFilter}
                                onChange={(e) => setUserIdFilter(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl">
                            {loading ? (
                                <div className="flex items-center justify-center h-64 text-slate-500">
                                    <FaSpinner className="animate-spin mr-3" /> Loading conversations...
                                </div>
                            ) : (
                                <div className="overflow-y-auto max-h-[500px]">
                                    {conversations.map((c) => (
                                        <div
                                            key={c.conversationId}
                                            onClick={() => handleThreadSelect(c)}
                                            className={`p-3 mb-2 rounded-xl cursor-pointer transition-all border group ${selectedThread?.conversationId === c.conversationId
                                                    ? "bg-indigo-600/10 border-indigo-500/30"
                                                    : "bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800/60"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">
                                                        {c.otherParticipant?.name || c.recruiter?.name || c.jobSeeker?.name || c.admin?.name || "—"}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {c.otherParticipant?.name ? `Admin ↔ ${c.otherParticipant?.name}`
                                                            : c.recruiter?.name && c.jobSeeker?.name
                                                                ? `${c.jobSeeker?.name}`
                                                            : c.participants?.map(p => p?.name).filter(Boolean).join(", ") || "—"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-[10px] px-2 py-1 rounded-full ${c.isLocked ? "bg-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}>
                                                        {c.isLocked ? "Locked" : "Active"}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleDeleteConversationFromList(c.conversationId, e)}
                                                        disabled={deletingConversation}
                                                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all p-1 rounded"
                                                        title="Delete conversation"
                                                    >
                                                        <FaTrash className="text-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 truncate">{c.lastMessage}</p>
                                        </div>
                                    ))}
                                    {conversations.length === 0 && (
                                        <p className="text-center py-10 text-slate-500 italic text-sm">No conversations found</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        {selectedThread ? (
                            <div className="flex flex-col h-[500px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {selectedThread.recruiter?.name && selectedThread.jobSeeker?.name
                                                ? `${selectedThread.recruiter?.name} ↔ ${selectedThread.jobSeeker?.name}`
                                                : selectedThread.otherParticipant?.name
                                                    ? `Admin ↔ ${selectedThread.otherParticipant?.name}`
                                            : selectedThread.participants?.map(p => p?.name).filter(Boolean).join(", ") || "—"}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{selectedThread.conversationId}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleLockConversation(selectedThread.conversationId, selectedThread.isLocked)}
                                            disabled={actionLoading || deletingConversation}
                                            className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${selectedThread.isLocked
                                                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30"
                                                    : "bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/30"
                                                }`}
                                        >
                                            {selectedThread.isLocked ? <FaUnlock /> : <FaLock />}
                                            {selectedThread.isLocked ? "Unlock" : "Lock"}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            disabled={deletingConversation}
                                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                            title="Delete conversation"
                                        >
                                            <FaTrash className="text-sm" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {loadingMessages ? (
                                        <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                                            <FaSpinner className="animate-spin mr-2" /> Loading...
                                        </div>
                                    ) : threadMessages.length === 0 ? (
                                        <p className="text-center text-slate-500 text-sm">No messages in this conversation</p>
                                    ) : (
                                        threadMessages.map((msg) => {
                                            const isSystem = msg.role === "admin" || msg.role === "system";
                                            const isRecruiterMsg = selectedThread?.recruiter?._id && msg.sender === selectedThread.recruiter._id;
                                            const isJobSeekerMsg = selectedThread?.jobSeeker?._id && msg.sender === selectedThread.jobSeeker._id;
                                            const isOtherParticipantMsg = selectedThread?.otherParticipant?._id && msg.sender === selectedThread.otherParticipant._id;
                                            const isAdminMsg = msg.role === "admin";
                                            return (
                                                <div
                                                    key={msg._id}
                                                    className={`flex ${isSystem || isAdminMsg ? "justify-center" : isRecruiterMsg || isJobSeekerMsg || isOtherParticipantMsg ? "justify-start" : "justify-end"}`}
                                                >
                                                    {isSystem ? (
                                                        <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-xs max-w-[80%]">
                                                            <FaExclamationTriangle className="inline mr-1" /> Admin: {msg.content}
                                                        </div>
                                                    ) : (
                                                        <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${isRecruiterMsg || isJobSeekerMsg || isOtherParticipantMsg ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200" : "bg-indigo-600 text-white"}`}>
                                                            <p>{msg.content}</p>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <span className="text-[9px] opacity-70">
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                                    disabled={actionLoading}
                                                                    className="text-rose-400 hover:text-rose-300 text-xs ml-2 cursor-pointer"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendAdminMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Send as admin / warn user..."
                                        value={adminMessage}
                                        onChange={(e) => setAdminMessage(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!adminMessage.trim() || actionLoading}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer"
                                    >
                                        Send
                                    </button>
                                </form>

                                {showDeleteConfirm && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-sm w-full mx-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                                    <FaExclamationTriangle className="text-lg" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Conversation</h3>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                                This will permanently delete all messages in this conversation. This action cannot be undone.
                                            </p>
                                            <div className="flex gap-3 justify-end">
                                                <button
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    disabled={deletingConversation}
                                                    className="px-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleDeleteConversation}
                                                    disabled={deletingConversation}
                                                    className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 transition-all"
                                                >
                                                    {deletingConversation ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[500px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-500 dark:text-slate-400">
                                <div className="text-center">
                                    <FaComments className="text-4xl mx-auto mb-3 text-slate-500 dark:text-slate-400" />
                                    <p>Select a conversation to view and moderate</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminConversationsPage;