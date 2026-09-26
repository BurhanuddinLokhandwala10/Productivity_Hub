import React from 'react';

/**
 * GithubAnalyticsCard displaying stats and interactive 6-month commit activity chart
 */
const GithubAnalyticsCard = ({ stats = { repositories: 8, monthlyCommits: 5, activeDays: 2, trendScore: 100 } }) => {
    // 6-month commit activity data: Jul, Aug, Sep, Oct, Nov, Dec
    const commitData = [
        { month: 'Jul', commits: 0 },
        { month: 'Aug', commits: 0 },
        { month: 'Sep', commits: 0 },
        { month: 'Oct', commits: 0 },
        { month: 'Nov', commits: 5 },
        { month: 'Dec', commits: 7 },
    ];

    const maxCommits = 10;
    const chartHeight = 110;

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
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                    View Details <span>&rarr;</span>
                </button>
            </div>

            {/* 4 Metric Boxes */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
                {/* Repositories */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-base font-extrabold text-slate-900 leading-tight">{stats.repositories}</div>
                        <div className="text-[11px] font-medium text-slate-500">Repositories</div>
                    </div>
                </div>

                {/* Monthly Commits */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-base font-extrabold text-slate-900 leading-tight">{stats.monthlyCommits}</div>
                        <div className="text-[11px] font-medium text-slate-500">Monthly Commits</div>
                    </div>
                </div>

                {/* Active Days */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-base font-extrabold text-slate-900 leading-tight">{stats.activeDays}</div>
                        <div className="text-[11px] font-medium text-slate-500">Active Days</div>
                    </div>
                </div>

                {/* Trend Score */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-base font-extrabold text-slate-900 leading-tight">{stats.trendScore}</div>
                        <div className="text-[11px] font-medium text-slate-500">Trend Score</div>
                    </div>
                </div>
            </div>

            {/* Commit Activity (Last 6 Months) Chart */}
            <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-800 mb-3">Commit Activity (Last 6 Months)</p>

                <div className="flex items-end gap-2 h-28 relative pt-2">
                    {/* Y-axis labels */}
                    <div className="flex flex-col justify-between h-24 text-[10px] text-slate-400 pr-1 select-none">
                        <span>10</span>
                        <span>8</span>
                        <span>6</span>
                        <span>4</span>
                        <span>2</span>
                        <span>0</span>
                    </div>

                    {/* Chart Bars Grid */}
                    <div className="flex-1 h-24 flex items-end justify-between relative border-b border-l border-slate-200">
                        {/* Background horizontal grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                            <div className="border-b border-dashed border-slate-200 w-full" />
                            <div className="border-b border-dashed border-slate-200 w-full" />
                            <div className="border-b border-dashed border-slate-200 w-full" />
                            <div className="border-b border-dashed border-slate-200 w-full" />
                            <div className="border-b border-dashed border-slate-200 w-full" />
                        </div>

                        {/* Bars */}
                        {commitData.map((item, idx) => {
                            const barHeight = item.commits > 0 ? (item.commits / maxCommits) * 100 : 0;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                                    <div
                                        style={{ height: `${barHeight}%` }}
                                        className={`w-6 rounded-t-md transition-all duration-300 ${
                                            item.commits > 0
                                                ? 'bg-gradient-to-t from-blue-500 to-indigo-400 group-hover:from-blue-600 group-hover:to-indigo-500 shadow-sm'
                                                : ''
                                        }`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* X-axis Month labels */}
                <div className="flex justify-between pl-5 mt-1.5 text-[10px] text-slate-400 font-medium">
                    {commitData.map((item, idx) => (
                        <span key={idx} className="flex-1 text-center">{item.month}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GithubAnalyticsCard;
