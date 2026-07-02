import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { 
    FaSearch, 
    FaMapMarkerAlt, 
    FaBriefcase, 
    FaDollarSign, 
    FaClock, 
    FaSpinner, 
    FaChevronLeft, 
    FaChevronRight,
    FaBuilding,
    FaCheckCircle,
    FaExternalLinkAlt
} from "react-icons/fa";
import toast from "react-hot-toast";

const JobPage = () => {
    const { accessToken, role } = useSelector((state) => state.auth);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());
    
    // Filter / Search states
    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    
    // Pagination states
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const loadJobs = async () => {
        setLoading(true);
        try {
            // Build query params
            const queryParams = new URLSearchParams();
            if (keyword) queryParams.append("keyword", keyword);
            if (location) queryParams.append("location", location);
            if (employmentType) queryParams.append("type", employmentType);
            queryParams.append("page", page);
            queryParams.append("limit", 6);

            const res = await api.get(`/jobs/get-job?${queryParams.toString()}`);
            if (res.data && res.data.success) {
                setJobs(res.data.jobs || []);
                setTotalPages(res.data.totalPage || 1);
                setTotalRecords(res.data.totalRecords || 0);
            }
        } catch (err) {
            console.error("Error fetching jobs list:", err);
            toast.error("Failed to fetch jobs listing");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, [page]);

    useEffect(() => {
        if (accessToken && role === "job_seeker") {
            api.get("/applications/me").then((res) => {
                if (res.data?.success) {
                    const ids = new Set(
                        (res.data.applications || [])
                            .filter((app) => app.job?._id)
                            .map((app) => app.job._id)
                    );
                    setAppliedJobIds(ids);
                }
            }).catch(() => {});
        }
    }, [accessToken, role, page]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        loadJobs();
    };

    const handleReset = () => {
        setKeyword("");
        setLocation("");
        setEmploymentType("");
        setPage(1);
        // We can execute loading after state resets by invoking loadJobs directly with clear parameters
        setTimeout(() => {
            loadJobs();
        }, 50);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Search Opportunities</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Explore matching postings, AI keywords matches, and apply directly.</p>
                </div>

                {/* Filter and Search Box */}
                <form 
                    onSubmit={handleSearchSubmit} 
                    className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 backdrop-blur-xl flex flex-col lg:flex-row gap-4 items-end"
                >
                    <div className="w-full lg:flex-1 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Search Keywords</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">
                                <FaSearch />
                            </span>
                            <input
                                type="text"
                                placeholder="Job title, keywords, or company..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-64 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Location Preference</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">
                                <FaMapMarkerAlt />
                            </span>
                            <input
                                type="text"
                                placeholder="City, country, remote..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-48 space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Employment Type</label>
                        <select
                            value={employmentType}
                            onChange={(e) => setEmploymentType(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 capitalize font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Types</option>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                            <option value="remote">Remote</option>
                        </select>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto shrink-0">
                        <button
                            type="submit"
                            className="flex-1 lg:flex-initial inline-flex justify-center items-center gap-2 py-2.5 px-6 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
                        >
                            Find Jobs
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                        >
                            Reset
                        </button>
                    </div>
                </form>

                {/* Job Cards Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400 gap-2">
                        <FaSpinner className="animate-spin text-3xl text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-medium">Scanning platform opportunities...</span>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-24 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/20">
                        <FaBriefcase className="mx-auto text-5xl text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">No postings matching filters</h3>
                        <p className="text-sm text-slate-500 mt-2">Try adjusting your keywords, locations, or reset filters.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => {
                                const isApplied = appliedJobIds.has(job._id);
                                return (
                                    <div
                                        key={job._id}
                                        className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between h-72 group shadow-lg"
                                    >
                                        <Link to={`/jobs/${job._id}`} className="block">
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{job.title}</h3>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                                                    {job.employmentType?.replace("-", " ")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {job.companyLogo ? (
                                                    <img src={job.companyLogo} alt={job.company} className="w-5 h-5 rounded object-contain" />
                                                ) : (
                                                    <FaBuilding className="text-sm text-slate-500 shrink-0" />
                                                )}
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">{job.company}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">{job.description}</p>
                                        </Link>

                                        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 mt-4 space-y-2">
                                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <FaMapMarkerAlt className="text-slate-500" />
                                                    <span>{job.location}</span>
                                                </span>
                                                <span className="text-indigo-600 dark:text-indigo-400 font-black">
                                                    {job.salaryMin ? `$${job.salaryMin}k - $${job.salaryMax}k` : "Salary Undisclosed"}
                                                </span>
                                            </div>
                                            <div>
                                                {isApplied ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        <FaCheckCircle /> Applied
                                                    </span>
                                                ) : (
                                                    <Link
                                                        to={`/jobs/${job._id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                                                    >
                                                        View Details & Apply <FaExternalLinkAlt size={10} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination buttons */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="inline-flex justify-center items-center h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                                >
                                    <FaChevronLeft />
                                </button>
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-bold">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="inline-flex justify-center items-center h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default JobPage;
