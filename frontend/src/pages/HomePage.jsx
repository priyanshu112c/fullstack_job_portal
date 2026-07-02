import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { FaBriefcase, FaGlobe, FaRobot, FaSearch, FaUserCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const HomePage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await api.get("/jobs/get-job?limit=3");
                if (res.data && res.data.success) {
                    setJobs(res.data.jobs);
                }
            } catch (err) {
                console.error("Error fetching featured jobs:", err);
                toast.error("Failed to load featured jobs");
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                {/* Decorative background glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="z-10"
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 rounded-full border border-indigo-200 dark:border-indigo-500/20 mb-6">
                        <FaRobot className="animate-pulse" /> AI-Powered Matchmaking Platform
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-tight">
                        Land your dream role <br className="hidden md:inline" />
                        with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400">AI Intelligence</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed">
                        Discover top opportunities tailored to your unique skillset. Analyze your resume instantly and match directly with top hiring recruiters.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/jobs" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xl shadow-indigo-600/40 transform hover:-translate-y-0.5">
                            <FaSearch className="text-sm" /> Explore Jobs
                        </Link>
                        <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 rounded-xl transition-all backdrop-blur-sm">
                            Register Profile
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Featured Jobs Section */}
            <section className="relative py-20 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">Opportunities</span>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2">Latest Job Openings</h2>
                        </div>
                        <Link to="/jobs" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium text-sm mt-4 md:mt-0 flex items-center gap-1 hover:underline">
                            View All Jobs &rarr;
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-pulse" />
                            ))}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 backdrop-blur-sm">
                            <FaBriefcase className="mx-auto text-4xl text-slate-400 dark:text-slate-600 mb-4" />
                            <h3 className="text-lg font-medium text-slate-500 dark:text-slate-300">No jobs posted yet</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Check back later or register as a Recruiter to post new jobs.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <div key={job._id} className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/80 p-6 transition-all duration-300 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">{job.employmentType}</span>
                                            <span className="text-sm text-indigo-600 dark:text-indigo-400 font-bold">{job.salaryMin ? `$${job.salaryMin}k - $${job.salaryMax}k` : "Salary Undisclosed"}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">{job.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{job.company} &bull; {job.location}</p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500 line-clamp-3 mb-6">{job.description}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-6">
                                        {job.skills?.slice(0, 3).map((skill, index) => (
                                            <span key={index} className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">{skill}</span>
                                        ))}
                                    </div>
                                    <Link to={`/jobs/${job._id}`} className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium bg-slate-800 text-white hover:bg-indigo-600 transition-colors">
                                        Apply Now
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 border-t border-slate-200 dark:border-slate-800/60">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">Features</span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-2">Engineered for Candidates and Recruiters</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-4">Enjoy deep analytics, conversational job pipelines, and automated intelligence tools.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 backdrop-blur-sm">
                            <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-xl text-indigo-600 dark:text-indigo-400 mb-6">
                                <FaRobot />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Resume AI Analyzer</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Upload your PDF resume to parse raw credentials instantly. Obtain visual scores, targeted improvement tips, strengths, and missing skills.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 backdrop-blur-sm">
                            <div className="h-12 w-12 rounded-xl bg-cyan-100 dark:bg-cyan-600/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-xl text-cyan-600 dark:text-cyan-400 mb-6">
                                <FaGlobe />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Real-Time Messaging</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Communicate securely using socket connections. Exchange direct messages instantly between recruiters and candidate seekers.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 backdrop-blur-sm">
                            <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-600/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-xl text-purple-600 dark:text-purple-400 mb-6">
                                <FaUserCheck />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Role Custom Routing</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Tailored workspace panels for Admin dashboard logs, Recruiter creation tools, and Seeker status tracking.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold">Trusted by tech professionals</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 relative">
                            <p className="text-slate-600 dark:text-slate-300 italic mb-6">
                                "The AI Resume analyzer is insanely precise. It pointed out critical missing keywords for my engineering manager profile. I applied and received an interview invitation 3 days later!"
                            </p>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Sarah Jenkins</h4>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400">Senior Staff Engineer</span>
                            </div>
                        </div>
                        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 relative">
                            <p className="text-slate-600 dark:text-slate-300 italic mb-6">
                                "Finding qualified candidates with matching skills used to take weeks. AIGravity sorts candidates by resume score and allows direct chat. Highly recommend!"
                            </p>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Marcus Vance</h4>
                                <span className="text-xs text-cyan-600 dark:text-cyan-400">Lead Tech Recruiter</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Ready to boost your career?</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-xl mx-auto">Create your account today and unlock AI matching, analytics, and instant messaging.</p>
                    <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xl shadow-indigo-600/30 transform hover:-translate-y-0.5">
                        Create Free Account
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <FaRobot className="text-indigo-600 dark:text-indigo-400 text-xl" />
                        <span className="font-bold text-lg text-slate-900 dark:text-white">AIGravity</span>
                    </div>
                    <p className="text-sm text-slate-400 dark:text-slate-500">&copy; {new Date().getFullYear()} AIGravity. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
