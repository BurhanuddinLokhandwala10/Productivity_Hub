import React from 'react';

/**
 * Reusable StatCard for top overview metrics (GitHub Score, LeetCode Progress, DSA Readiness)
 */
const StatCard = ({ icon, iconBg, title, value, maxVal, statusBadge, statusColor, chartType }) => {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-200 flex items-center justify-between">
            <div className="flex items-start gap-4">
                {/* Icon box */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg} shadow-sm`}>
                    {icon}
                </div>

                {/* Info */}
                <div>
                    <p className="text-xs font-semibold text-slate-500">{title}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
                        {maxVal && <span className="text-sm font-semibold text-slate-400">/{maxVal}</span>}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`text-xs font-semibold ${statusColor}`}>
                            {statusBadge}
                        </span>
                    </div>
                </div>
            </div>

            {/* Mini Chart Graphic on the Right */}
            <div className="w-20 h-10 flex items-end justify-end">
                {chartType === 'green-bars' && (
                    <div className="flex items-end gap-1 h-8">
                        <span className="w-1.5 h-3 bg-emerald-300 rounded-sm" />
                        <span className="w-1.5 h-4 bg-emerald-400 rounded-sm" />
                        <span className="w-1.5 h-5 bg-emerald-400 rounded-sm" />
                        <span className="w-1.5 h-7 bg-emerald-500 rounded-sm" />
                        <span className="w-1.5 h-8 bg-emerald-500 rounded-sm" />
                    </div>
                )}
                {chartType === 'orange-bars' && (
                    <div className="flex items-end gap-1 h-8 opacity-40">
                        <span className="w-1.5 h-2 bg-amber-300 rounded-sm" />
                        <span className="w-1.5 h-3 bg-amber-400 rounded-sm" />
                        <span className="w-1.5 h-5 bg-amber-400 rounded-sm" />
                        <span className="w-1.5 h-6 bg-amber-500 rounded-sm" />
                        <span className="w-1.5 h-7 bg-amber-500 rounded-sm" />
                    </div>
                )}
                {chartType === 'purple-wave' && (
                    <svg className="w-20 h-10 overflow-visible" viewBox="0 0 80 40">
                        <defs>
                            <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M0,35 Q20,38 40,25 T80,10 L80,40 L0,40 Z"
                            fill="url(#purpleGrad)"
                        />
                        <path
                            d="M0,35 Q20,38 40,25 T80,10"
                            fill="none"
                            stroke="#a855f7"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default StatCard;
