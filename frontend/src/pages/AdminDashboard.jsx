import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import DashboardChart from "../components/DashboardChart";
import toast from "react-hot-toast";
import { 
    FaUsers, 
    FaBriefcase, 
    FaFileInvoice, 
    FaArrowRight, 
    FaUserCheck,
    FaHeartbeat 
} from "react-icons/fa";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRecruiters: 0,
        totalJobSeekers: 0,
        totalJobs: 0,
        totalApplications: 0
    });
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAdminStats = async () => {
        try {
            const statsRes = await api.get("/admin/dashboard");
            if (statsRes.data && statsRes.data.success) {
                setStats(statsRes.data.stats || {});
            }

            const monthlyRes = await api.get("/admin/monthly-users");
            if (monthlyRes.data && monthlyRes.data.success) {
                setMonthlyData(monthlyRes.data.data || []);
            }
        } catch (err) {
            console.error("Error loading admin stats:", err);
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminStats();
    }, []);

    // Prepare chart labels for 12 months, mapping counts to matching months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartLabels = monthNames;
    const chartValues = Array(12).fill(0);
    
    monthlyData.forEach(item => {
        const mIndex = item._id?.month - 1;
        if (mIndex >= 0 && mIndex < 12) {
            chartValues[mIndex] = item.count;
        }
    });

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: "User Signups",
                data: chartValues,
                fill: true,
                borderColor: "#6366f1",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                tension: 0.4,
            }
        ]
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor registrations, control access levels, and audit posting compliance.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/admin/users" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all">
                            <FaUsers /> Control Users
                        </Link>
                        <Link to="/admin/jobs" className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-semibold transition-all">
                            Moderate Listings
                        </Link>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Platform Users" value={stats.totalUsers} />
                    <StatCard title="Active Recruiter Accounts" value={stats.totalRecruiters} />
                    <StatCard title="Registered Job Seekers" value={stats.totalJobSeekers} />
                    <StatCard title="Total Job Postings" value={stats.totalJobs} />
                </div>

                {/* Aggregate Chart and Platform Health Panel */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Monthly chart */}
                    <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                        <h3 className="text-lg font-bold mb-4">Monthly User Registrations</h3>
                        <div className="h-64 flex items-center justify-center">
                            <DashboardChart data={chartData} />
                        </div>
                    </div>

                    {/* Quick moderation tools */}
                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold">Health & Auditing</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                    <div className="flex items-center gap-2.5 text-xs font-bold">
                                        <FaHeartbeat className="text-sm" />
                                        <span>Server Status: Online</span>
                                    </div>
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                </div>

                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                    <div className="flex items-center gap-2.5 text-xs font-bold">
                                        <FaUserCheck className="text-sm" />
                                        <span>Applications: {stats.totalApplications} logged</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-900">
                            <Link to="/admin/users" className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/40 text-sm font-semibold transition-all group">
                                <span>Platform Member Lists</span>
                                <FaArrowRight className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/admin/jobs" className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/40 text-sm font-semibold transition-all group">
                                <span>Moderate Active Listings</span>
                                <FaArrowRight className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;