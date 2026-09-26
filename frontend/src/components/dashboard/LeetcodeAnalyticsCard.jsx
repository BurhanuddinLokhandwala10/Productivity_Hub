import React from 'react';

/**
 * LeetcodeAnalyticsCard displaying problem stats and progress distribution donut chart
 */
const LeetcodeAnalyticsCard = ({ stats = { solved: 0, easy: 0, medium: 0, hard: 0, rating: 0, streak: 0 } }) => {
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

            {/* 6 Metric Grid (3 cols, 2 rows) */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
                {/* Problems Solved */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-slate-900 leading-tight">{stats.solved}</div>
                        <div className="text-[10px] font-medium text-slate-500 leading-tight">Problems Solved</div>
                    </div>
                </div>

                {/* Easy */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-slate-900 leading-tight">{stats.easy}</div>
                        <div className="text-[10px] font-medium text-slate-500 leading-tight">Easy</div>
                    </div>
                </div>

                {/* Medium */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-slate-900 leading-tight">{stats.medium}</div>
                        <div className="text-[10px] font-medium text-slate-500 leading-tight">Medium</div>
                    </div>
                </div>

                {/* Hard */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-slate-900 leading-tight">{stats.hard}</div>
                        <div className="text-[10px] font-medium text-slate-500 leading-tight">Hard</div>
                    </div>
                </div>

                {/* Rating */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-slate-900 leading-tight">{stats.rating || 0}</div>
                        <div className="text-[10px] font-medium text-slate-500 leading-tight">Rating</div>
                    </div>
                </div>

                {/* Streak */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-slate-900 leading-tight">{stats.streak || 0}</div>
                        <div className="text-[10px] font-medium text-slate-500 leading-tight">Streak</div>
                    </div>
                </div>
            </div>

            {/* Progress Distribution Donut Chart */}
            <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-800 mb-3">Progress Distribution</p>

                <div className="flex items-center justify-center gap-8 py-1">
                    {/* SVG Donut Chart */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background track circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#f1f5f9"
                                strokeWidth="14"
                                fill="transparent"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-black text-slate-800">0%</span>
                        </div>
                    </div>

                    {/* Breakdown Legend */}
                    <div className="space-y-2 text-xs font-medium">
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-slate-600">Easy</span>
                            <span className="text-slate-800 font-bold ml-auto">{stats.easy} (0%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <span className="text-slate-600">Medium</span>
                            <span className="text-slate-800 font-bold ml-auto">{stats.medium} (0%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="text-slate-600">Hard</span>
                            <span className="text-slate-800 font-bold ml-auto">{stats.hard} (0%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeetcodeAnalyticsCard;
