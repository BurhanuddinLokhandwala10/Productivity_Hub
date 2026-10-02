import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * GithubAnalyticsCard displaying live stats and commit velocity
 */
const GithubAnalyticsCard = ({ stats = {} }) => {
    const navigate = useNavigate();
    const [animated, setAnimated] = useState(false);
    const chartRef = useRef(null);

    const repositories = stats.repositories || 0;
    const currentMonthCommits = stats.currentMonthCommits || 0;
    const lastMonthCommits = stats.lastMonthCommits || 0;
    const activeDays = stats.activeDays || 0;
    const trendScore = stats.trendScore || 0;

    // Animate bars when card scrolls into view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
            { threshold: 0.3 }
        );
        if (chartRef.current) observer.observe(chartRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] flex flex-col justify-between">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <h3 className="font-bold text-slate-800 text-sm">GitHub Analytics</h3>
                </div>
                <button
                    onClick={() => navigate('/dashboard/github')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                    View Details <span>&rarr;</span>
                </button>
            </div>

            {/* Metric Boxes */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-base font-extrabold text-slate-900 leading-tight">{repositories}</div>
                        <div className="text-[11px] font-medium text-slate-500">Repositories</div>
                    </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-base font-extrabold text-slate-900 leading-tight">{currentMonthCommits}</div>
                        <div className="text-[11px] font-medium text-slate-500">This Month</div>
                    </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-base font-extrabold text-slate-900 leading-tight">{lastMonthCommits}</div>
                        <div className="text-[11px] font-medium text-slate-500">Last Month</div>
                    </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-base font-extrabold text-slate-900 leading-tight">{activeDays}</div>
                        <div className="text-[11px] font-medium text-slate-500">Active Days</div>
                    </div>
                </div>
            </div>

            {/* Mini Commit Activity Summary */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs" ref={chartRef}>
                <span className="text-slate-500 font-medium">Trend Score:</span>
                <span className="font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded-lg">{trendScore}/100</span>
            </div>
        </div>
    );
};

export default GithubAnalyticsCard;
