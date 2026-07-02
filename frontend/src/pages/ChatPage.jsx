import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import {
    FaUserCircle,
    FaPaperPlane,
    FaComments,
    FaSearch,
    FaCircle,
    FaSpinner,
    FaTrash,
    FaExclamationTriangle,
    FaArrowLeft
} from "react-icons/fa";
import toast from "react-hot-toast";

const ChatPage = () => {
    const [searchParams] = useSearchParams();
    const queryUserId = searchParams.get("userId");

    const currentUser = useSelector((state) => state.auth.user);
    const currentUserId = currentUser?._id;

    const buildConversationKey = (a, b) => {
        const [x, y] = [a?.toString(), b?.toString()].sort();
        return `${x}:${y}`;
    };

    const [conversations, setConversations] = useState([]);
    const [activePartner, setActivePartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [deletingConversation, setDeletingConversation] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showMobileList, setShowMobileList] = useState(true);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const activePartnerRef = useRef(null);

    activePartnerRef.current = activePartner;

    const refreshConversations = useCallback(async (selectPartnerId = null) => {
        try {
            const res = await api.get("/message/conversations");
            if (res.data && res.data.success) {
                const list = res.data.conversations || [];
                setConversations(list);
                if (selectPartnerId) {
                    const match = list.find(c => c.partner?._id === selectPartnerId);
                    if (match) {
                        setActivePartner(match.partner);
                    }
                }
            }
        } catch (err) {
            console.error("Error loading conversations list:", err);
            toast.error("Failed to load conversations");
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    useEffect(() => {
        if (!currentUserId) return;

        const socketHost = import.meta.env.VITE_API_URL.replace("/api/v1", "");
        const socket = io(socketHost, { withCredentials: true });
        socketRef.current = socket;

        socket.emit("join", currentUserId);

        const receiveMessageHandler = (message) => {
            const partner = activePartnerRef.current;

            const isRelevant =
                (message.sender === partner?._id && message.receiver === currentUserId) ||
                (message.sender === currentUserId && message.receiver === partner?._id);

            if (!isRelevant) return;

            setMessages((prev) => {
                const SERVER_TIME_MATCH_WINDOW_MS = 30_000;

                const serverCreatedAtMs = message?.createdAt ? new Date(message.createdAt).getTime() : NaN;

                const matchedIndex = prev.findIndex((m) => {
                    if (!m) return false;
                    if (m.sender !== message.sender) return false;
                    if (m.receiver !== message.receiver) return false;
                    if (m.content !== message.content) return false;

                    if (!m.createdAt || Number.isNaN(serverCreatedAtMs)) return true;

                    const optimisticCreatedAtMs = new Date(m.createdAt).getTime();
                    if (Number.isNaN(optimisticCreatedAtMs)) return true;

                    return Math.abs(serverCreatedAtMs - optimisticCreatedAtMs) <= SERVER_TIME_MATCH_WINDOW_MS;
                });

                if (matchedIndex !== -1) {
                    const next = [...prev];
                    next[matchedIndex] = message;
                    return next;
                }

                const alreadyExists = prev.some((m) => m?._id === message?._id);
                if (alreadyExists) return prev;

                return [...prev, message];
            });

            refreshConversations();
        };

        const adminMessageHandler = (message) => {
            const partner = activePartnerRef.current;

            const isRelevant =
                (message.sender === partner?._id && message.receiver === currentUserId) ||
                (message.sender === currentUserId && message.receiver === partner?._id);

            if (!isRelevant) return;

            setMessages((prev) => {
                const alreadyExists = prev.some((m) => m?._id === message?._id);
                if (alreadyExists) return prev;
                return [...prev, message];
            });
            refreshConversations();
        };

        const messageDeletedHandler = ({ messageId }) => {
            setMessages((prev) => prev.filter((m) => m._id !== messageId));
        };

        const conversationLockedHandler = ({ conversationKey }) => {
            console.log("Conversation locked:", conversationKey);
        };

        const conversationUnlockedHandler = ({ conversationKey }) => {
            console.log("Conversation unlocked:", conversationKey);
        };

        const conversationDeletedHandler = ({ conversationKey, deletedBy }) => {
            const partnerId = conversationKey?.split(":").find(id => id !== currentUserId);
            if (partnerId) {
                setConversations(prev => prev.filter(c => c.partner?._id !== partnerId));
            }
            if (activePartnerRef.current) {
                const myKey = buildConversationKey(currentUserId, activePartnerRef.current._id);
                if (myKey === conversationKey || deletedBy === currentUserId) {
                    setMessages([]);
                    setActivePartner(null);
                }
            }
        };

        socket.on("receive_message", receiveMessageHandler);
        socket.on("admin_message", adminMessageHandler);
        socket.on("message_deleted", messageDeletedHandler);
        socket.on("conversation_locked", conversationLockedHandler);
        socket.on("conversation_unlocked", conversationUnlockedHandler);
        socket.on("conversation_deleted", conversationDeletedHandler);

        return () => {
            socket.off("receive_message", receiveMessageHandler);
            socket.off("admin_message", adminMessageHandler);
            socket.off("message_deleted", messageDeletedHandler);
            socket.off("conversation_locked", conversationLockedHandler);
            socket.off("conversation_unlocked", conversationUnlockedHandler);
            socket.off("conversation_deleted", conversationDeletedHandler);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [currentUserId, refreshConversations]);

    useEffect(() => {
        refreshConversations();
    }, [refreshConversations]);

    useEffect(() => {
        const loadQueryUser = async () => {
            if (!queryUserId) return;
            const match = conversations.find(c => c.partner?._id === queryUserId);
            if (match) {
                setActivePartner(match.partner);
            } else {
                try {
                    setLoadingMessages(true);
                    const res = await api.get(`/users/${queryUserId}`);
                    if (res.data && res.data.success) {
                        const userProfile = res.data.user;
                        setActivePartner(userProfile);
                        setConversations(prev => {
                            if (prev.some(c => c.partner?._id === userProfile._id)) return prev;
                            return [{
                                partner: userProfile,
                                lastMessage: "Start typing to begin conversation...",
                                lastMessageTime: new Date().toISOString()
                            }, ...prev];
                        });
                    }
                } catch (err) {
                    console.error("Failed to load query user profile details:", err);
                    toast.error("Could not fetch user details for messaging");
                } finally {
                    setLoadingMessages(false);
                }
            }
        };
        if (conversations.length > 0 || !loadingConversations) {
            loadQueryUser();
        }
    }, [queryUserId, conversations.length, loadingConversations]);

    useEffect(() => {
        const loadMessages = async () => {
            if (!activePartner?._id) return;
            setLoadingMessages(true);
            try {
                const res = await api.get(`/message/${activePartner._id}`);
                if (res.data && res.data.success) {
                    setMessages(res.data.message || []);
                }
            } catch (err) {
                console.error("Error fetching message logs:", err);
                toast.error("Failed to fetch messages history");
            } finally {
                setLoadingMessages(false);
            }
        };
        loadMessages();
    }, [activePartner]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (activePartner) {
            setShowMobileList(false);
        }
    }, [activePartner]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputText.trim() === "" || !activePartner?._id || !socketRef.current) return;

        const payload = {
            sender: currentUserId,
            receiver: activePartner._id,
            content: inputText.trim()
        };

        socketRef.current.emit("send_message", payload);

        const optimisticMsg = {
            ...payload,
            _id: Math.random().toString(),
            createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        setInputText("");

        setConversations(prev => {
            const index = prev.findIndex(c => c.partner?._id === activePartner._id);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    lastMessage: payload.content,
                    lastMessageTime: new Date().toISOString()
                };
                return [updated[index], ...updated.filter((_, i) => i !== index)];
            }
            return prev;
        });
    };

    const handleDeleteConversation = async () => {
        if (!activePartner?._id) return;
        setDeletingConversation(true);
        const partnerId = activePartner._id;
        try {
            setConversations(prev => prev.filter(c => c.partner?._id !== partnerId));
            setMessages([]);
            setActivePartner(null);
            const res = await api.delete(`/message/conversations/${partnerId}`);
            if (res.data?.success) {
                toast.success("Conversation deleted");
            } else {
                refreshConversations();
            }
            setShowDeleteConfirm(false);
        } catch (err) {
            refreshConversations();
            toast.error(err.response?.data?.message || "Failed to delete conversation");
        } finally {
            setDeletingConversation(false);
        }
    };

    const handleDeleteConversationFromList = async (partnerId, e) => {
        e.stopPropagation();
        setDeletingConversation(true);
        try {
            setConversations(prev => prev.filter(c => c.partner?._id !== partnerId));
            if (activePartner?._id === partnerId) {
                setMessages([]);
                setActivePartner(null);
            }
            const res = await api.delete(`/message/conversations/${partnerId}`);
            if (res.data?.success) {
                toast.success("Conversation deleted");
            } else {
                refreshConversations();
            }
        } catch (err) {
            refreshConversations();
            toast.error(err.response?.data?.message || "Failed to delete conversation");
        } finally {
            setDeletingConversation(false);
        }
    };

    const handleSelectConversation = (partner) => {
        setActivePartner(partner);
        setShowMobileList(false);
    };

    const handleBackToList = () => {
        setShowMobileList(true);
    };

    const filteredConversations = conversations.filter(c =>
        c.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-12rem)] flex rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 overflow-hidden backdrop-blur-xl">
                {/* Conversation List - hidden on mobile when chat is active */}
                <div className={`${
                    showMobileList ? "flex" : "hidden"
                } md:flex w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex-col h-full shrink-0`}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm">
                                <FaSearch />
                            </span>
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900/60">
                        {loadingConversations ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400 gap-2">
                                <FaSpinner className="animate-spin text-xl text-indigo-600 dark:text-indigo-400" />
                                <span className="text-xs">Loading conversations...</span>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs">
                                No active conversations
                            </div>
                        ) : (
                            filteredConversations.map((c) => {
                                const isSelected = activePartner?._id === c.partner?._id;
                                return (
                                    <div
                                        key={c.partner?._id}
                                        onClick={() => handleSelectConversation(c.partner)}
                                        className={`p-4 flex items-center gap-3 cursor-pointer transition-all group ${isSelected
                                            ? "bg-indigo-600/10 dark:bg-indigo-600/10 border-l-4 border-l-indigo-500"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-900/20"
                                        }`}
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-lg text-slate-500 dark:text-slate-400 flex-shrink-0">
                                            <FaUserCircle className="text-xl" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{c.partner?.name}</h4>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-slate-500 shrink-0">
                                                        {c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleDeleteConversationFromList(c.partner._id, e)}
                                                        disabled={deletingConversation}
                                                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all p-1 rounded"
                                                        title="Delete conversation"
                                                    >
                                                        <FaTrash className="text-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-relaxed">
                                                {c.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Area - hidden on mobile when showing the list */}
                <div className={`${
                    activePartner && !showMobileList ? "flex" : "hidden"
                } md:flex flex-1 flex-col h-full bg-slate-50/40 dark:bg-slate-950/20`}>
                    {activePartner ? (
                        <>
                            <div className="px-4 md:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleBackToList}
                                        className="md:hidden inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                        aria-label="Back to conversations"
                                    >
                                        <FaArrowLeft />
                                    </button>
                                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                        <FaUserCircle className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{activePartner.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <FaCircle className="text-emerald-500 text-[8px]" />
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize">{activePartner.role?.replace("_", " ")}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={deletingConversation}
                                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                    title="Delete conversation"
                                >
                                    <FaTrash className="text-sm" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                                {loadingMessages ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 gap-2">
                                        <FaSpinner className="animate-spin text-xl text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-xs">Fetching messages history...</span>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 py-16 text-center">
                                        <FaComments className="text-3xl text-slate-500 dark:text-slate-400 mb-2" />
                                        <p className="text-xs">No message exchange started yet.</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Type below to send a first message.</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isCurrentUser = msg.sender === currentUserId;
                                        const isSystemMessage = msg.role === "system" || msg.role === "admin";

                                        if (isSystemMessage) {
                                            return (
                                                <div
                                                    key={msg._id}
                                                    className="flex justify-center"
                                                >
                                                    <div className="max-w-[80%] rounded-xl px-4 py-2 text-xs bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Admin:</span> {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={msg._id}
                                                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                                            >
                                                <div className={`max-w-[75%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isCurrentUser
                                                    ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/10"
                                                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-bl-none"
                                                }`}>
                                                    <p className="leading-relaxed break-words">{msg.content}</p>
                                                    <span className={`block text-[9px] mt-1 text-right ${isCurrentUser ? "text-indigo-200" : "text-slate-500 dark:text-slate-400"
                                                    }`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form
                                onSubmit={handleSendMessage}
                                className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 flex gap-3 items-center"
                            >
                                <input
                                    type="text"
                                    placeholder="Type message details here..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={inputText.trim() === ""}
                                    className="h-11 w-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex-shrink-0"
                                >
                                    <FaPaperPlane className="text-sm" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-8 text-center h-full">
                            <FaComments className="text-5xl text-slate-400 dark:text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Select a Conversation</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                Choose a contact from the inbox list on the left, or initiate chat directly from listings or candidate profiles.
                            </p>
                        </div>
                    )}
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
                                    This will permanently delete all messages with {activePartner?.name}. This action cannot be undone.
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
            </div>
        </DashboardLayout>
    );
};

export default ChatPage;
