import React, { useState, useEffect, useRef } from 'react';

/**
 * LeetcodeAnalyticsCard with animated donut chart
 */
const LeetcodeAnalyticsCard = ({ stats }) => {
    const [animated, setAnimated] = useState(false);
    const chartRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
            { threshold: 0.3 }
        );
        if (chartRef.current) observer.observe(chartRef.current);
        return () => observer.disconnect();
    }, []);

    // Donut chart values
    const total = stats.easy + stats.medium + stats.hard;
    const circumference = 2 * Math.PI * 40; // radius=40
    const easyPct = total > 0 ? (stats.easy / total) * 100 : 0;
    const medPct = total > 0 ? (stats.medium / total) * 100 : 0;
    const hardPct = total > 0 ? (stats.hard / total) * 100 : 0;

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                        &lt;/&gt;
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">LeetCode Analytics</h3>
                </div>
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                    View Details <span>&rarr;</span>
                </button>
            </div>

            {/* 6 Metric Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
                {[
                    { val: stats.solved, label: 'Problems Solved', color: 'bg-emerald-50 text-emerald-600', iconPath: 'M5 13l4 4L19 7' },
                    { val: stats.easy, label: 'Easy', color: 'bg-emerald-50 text-emerald-600', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { val: stats.medium, label: 'Medium', color: 'bg-amber-50 text-amber-500', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { val: stats.hard, label: 'Hard', color: 'bg-rose-50 text-rose-500', iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                    { val: stats.rating || 0, label: 'Rating', color: 'bg-purple-50 text-purple-600', iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
                    { val: stats.streak || 0, label: 'Streak', color: 'bg-orange-50 text-orange-500', iconPath: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2 hover:shadow-sm transition-shadow">
                        <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-slate-900 leading-tight">{item.val}</div>
                            <div className="text-[10px] font-medium text-slate-500 leading-tight">{item.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Animated Donut Chart */}
            <div className="pt-2 border-t border-slate-100" ref={chartRef}>
                <p className="text-xs font-bold text-slate-800 mb-3">Progress Distribution</p>
                <div className="flex items-center justify-center gap-8 py-1">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
                            {/* Animated track */}
                            <circle
                                cx="50" cy="50" r="40"
                                stroke="#e2e8f0"
                                strokeWidth="14"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={animated ? 0 : circumference}
                                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.65, 0, 0.35, 1)' }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-lg font-black text-slate-800 transition-opacity duration-700 ${animated ? 'opacity-100' : 'opacity-0'}`}>
                                {total > 0 ? `${Math.round((stats.solved / total) * 100)}%` : '0%'}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2 text-xs font-medium">
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-slate-600">Easy</span>
                            <span className="text-slate-800 font-bold ml-auto">{stats.easy} ({easyPct.toFixed(0)}%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <span className="text-slate-600">Medium</span>
                            <span className="text-slate-800 font-bold ml-auto">{stats.medium} ({medPct.toFixed(0)}%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="text-slate-600">Hard</span>
                            <span className="text-slate-800 font-bold ml-auto">{stats.hard} ({hardPct.toFixed(0)}%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeetcodeAnalyticsCard;
