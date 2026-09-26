import React from 'react';

/**
 * DsaReadinessCard displaying circular gauge score, priority breakdowns, and weak topics
 */
const DsaReadinessCard = ({ data = { readinessScore: 0.58, label: 'Early Stage' } }) => {
    const weakTopics = [
        'BINARY SEARCH',
        'BIT MANIPULATION',
        'DESIGN & OOP',
        'DYNAMIC PROGRAMMING',
        'GRAPHS'
    ];

    // For a radius of 42: circumference is 2 * PI * 42 = ~264
    const circumference = 264;
    // 58% of circumference
    const strokeDashoffset = circumference - (circumference * 0.58);

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
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
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
                            stroke="#e2e8f0"
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
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-black text-slate-900 leading-none">0.58</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-1">Early Stage</span>
                    </div>
                </div>

                {/* Priority Breakdown List */}
                <div className="space-y-1.5 flex-1 pl-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-slate-700 font-medium text-[11px]">Must Do Problems</span>
                        </div>
                        <span className="text-slate-800 font-bold text-[11px]">1/101 (0.99%)</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-slate-700 font-medium text-[11px]">High Priority</span>
                        </div>
                        <span className="text-slate-800 font-bold text-[11px]">0/154 (0%)</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                            <span className="text-slate-700 font-medium text-[11px]">Medium Problems</span>
                        </div>
                        <span className="text-slate-800 font-bold text-[11px]">0/178 (0%)</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            <span className="text-slate-700 font-medium text-[11px]">Hard Problems</span>
                        </div>
                        <span className="text-slate-800 font-bold text-[11px]">0/33 (0%)</span>
                    </div>
                </div>
            </div>

            {/* Weak Topics Section */}
            <div className="pt-2.5 border-t border-slate-100 mt-2">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-800">Weak Topics</p>
                    <button className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer">
                        View All <span>&rarr;</span>
                    </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {weakTopics.map((topic, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50/70 border border-blue-100 text-blue-700 font-bold text-[10px] rounded-lg tracking-wider hover:bg-blue-100 transition-colors"
                        >
                            {topic}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DsaReadinessCard;
