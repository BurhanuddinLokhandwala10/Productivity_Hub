import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DsaReadinessCard displaying circular gauge score, priority breakdowns, and weak topics
 * Uses real live values without hardcoded percentages
 */
const DsaReadinessCard = ({ data = {} }) => {
    const navigate = useNavigate();

    const readinessScore = Number(data.readinessScore) || 0;
    const label = data.label || 'Early Stage';
    const must = data.dsaMust || { solved: 0, total: 0, percentage: 0 };
    const high = data.dsaHigh || { solved: 0, total: 0, percentage: 0 };
    const weakTopics = data.dsaWeakTopics || [];
    const difficulty = data.dsaDifficulty || [];

    // For a radius of 42: circumference is 2 * PI * 42 = ~264
    const circumference = 264;
    const pctClamped = Math.min(Math.max(readinessScore, 0), 100) / 100;
    const strokeDashoffset = circumference - (circumference * pctClamped);

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">DSA Readiness</h3>
                </div>
                <button
                    onClick={() => navigate('/dashboard/dsa')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                    View Details <span>&rarr;</span>
                </button>
            </div>

            {/* Circular Gauge and Priority Breakdown */}
            <div className="flex items-center justify-between gap-4 py-1">
                {/* Circular Gauge */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background track circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="#f1f5f9"
                            strokeWidth="9"
                            fill="transparent"
                        />
                        {/* Purple Progress bar */}
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="#8b5cf6"
                            strokeWidth="9"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-black text-slate-900 leading-none">{readinessScore}%</span>
                        <span className="text-[9px] font-bold text-indigo-600 mt-1 max-w-[80px] truncate">{label}</span>
                    </div>
                </div>

                {/* Priority Breakdown List */}
                <div className="space-y-2 flex-1 pl-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                            <span className="text-slate-700 font-medium text-[11px]">MUST Solve</span>
                        </div>
                        <span className="text-slate-800 font-bold text-[11px]">
                            {must.solved || 0}/{must.total || 0} ({must.percentage || 0}%)
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                            <span className="text-slate-700 font-medium text-[11px]">HIGH Priority</span>
                        </div>
                        <span className="text-slate-800 font-bold text-[11px]">
                            {high.solved || 0}/{high.total || 0} ({high.percentage || 0}%)
                        </span>
                    </div>

                    {difficulty.slice(0, 1).map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                <span className="text-slate-700 font-medium text-[11px]">{d.difficulty} Tiers</span>
                            </div>
                            <span className="text-slate-800 font-bold text-[11px]">
                                {d.solved || 0}/{d.total || 0} ({d.percentage || 0}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weak Topics Footer */}
            <div className="pt-2.5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700">Priority Topics</span>
                    <span className="text-[10px] text-slate-400">Needs Practice</span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {weakTopics.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-bold rounded-md">
                            {typeof item === 'string' ? item : item.topic}
                        </span>
                    ))}
                    {weakTopics.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No weak topics recorded</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DsaReadinessCard;
