import React, { useState, useEffect, useRef } from 'react';
import TopNavbar from '../TopNavbar.jsx';
import ContributionHeatmap from '../common/ContributionHeatmap.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const GitHubAnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [health, setHealth] = useState(null);
    const [stats, setStats] = useState(null);
    const [trend, setTrend] = useState([]);
    const [activity, setActivity] = useState([]);
    const [animated, setAnimated] = useState(false);
    const chartRef = useRef(null);

    const token = localStorage.getItem('Token');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [healthRes, statsRes, trendRes, activityRes] = await Promise.all([
                fetch(`${API_BASE_URL}/github/progress`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/github/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/github/commit-trend`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/github/activity`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            if (healthRes.ok) {
                const d = await healthRes.json();
                setHealth(d);
            }
            if (statsRes.ok) {
                const d = await statsRes.json();
                setStats(d.stats);
            }
            if (trendRes.ok) {
                const d = await trendRes.json();
                setTrend(d.trend || []);
            }
            if (activityRes.ok) {
                const d = await activityRes.json();
                setActivity(d.activity || []);
            }
        } catch (e) {
            setError('Unable to load GitHub analytics.');
        } finally {
            setLoading(false);
            // Trigger animation after DOM render
            setTimeout(() => setAnimated(true), 150);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch(`${API_BASE_URL}/platform/stats?platform=github`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                await fetchData();
            }
        } catch (e) {
            // ignore
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Build continuous 30-day series ending today
    const fullTrend = React.useMemo(() => {
        const trendMap = {};
        if (Array.isArray(trend)) {
            trend.forEach(t => {
                if (t && t.date) {
                    const key = String(t.date).split('T')[0];
                    trendMap[key] = Number(t.commits) || 0;
                }
            });
        }
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            const shortLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            days.push({
                date: dateStr,
                label: shortLabel,
                commits: trendMap[dateStr] || 0
            });
        }
        return days;
    }, [trend]);

    const maxTrendCommits = React.useMemo(() => {
        const max = Math.max(...fullTrend.map(t => t.commits), 0);
        return max > 0 ? max : 1;
    }, [fullTrend]);

    return (
        <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <TopNavbar title="GitHub Analytics" subtitle="Your GitHub development activity and health metrics" />

                {/* Sync button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60"
                    >
                        <svg className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {syncing ? 'Syncing...' : 'Sync GitHub'}
                    </button>
                </div>

                {/* Health Score Card */}
                {health && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Health Score: {health.score}/100</h2>
                                <span className={`text-xs font-semibold ${health.trend === 'IMPROVING' ? 'text-emerald-600' : health.trend === 'DECLINING' ? 'text-rose-500' : 'text-slate-500'}`}>
                                    {health.trend === 'IMPROVING' ? '↗' : health.trend === 'DECLINING' ? '↘' : '→'} {health.trend}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-slate-900">{health.activity?.score?.toFixed(0) || 0}</div>
                                <div className="text-[11px] font-medium text-slate-500 mt-1">Activity Score</div>
                                <div className="text-[10px] text-slate-400">{health.activity?.currentMonthCommits || 0} commits this month</div>
                            </div>
                            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-slate-900">{health.consistency?.score?.toFixed(0) || 0}</div>
                                <div className="text-[11px] font-medium text-slate-500 mt-1">Consistency Score</div>
                                <div className="text-[10px] text-slate-400">{health.consistency?.monthlyActiveDays || 0} active days</div>
                            </div>
                            <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-slate-900">{health.trendAnalysis?.score?.toFixed(0) || 0}</div>
                                <div className="text-[11px] font-medium text-slate-500 mt-1">Trend Score</div>
                                <div className="text-[10px] text-slate-400">{health.trendAnalysis?.currentCommits || 0} → {health.trendAnalysis?.previousCommits || 0}</div>
                            </div>
                            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-slate-900">{health.repositories?.total || 0}</div>
                                <div className="text-[11px] font-medium text-slate-500 mt-1">Repositories</div>
                                <div className="text-[10px] text-slate-400">Score: {health.repositories?.score?.toFixed(0) || 0}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Commit Stats */}
                {stats && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                        <h3 className="font-bold text-slate-800 text-sm mb-4">Commit Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Today', value: stats.todayCommits || 0, color: 'bg-blue-50 text-blue-600' },
                                { label: 'This Week', value: stats.weeklyCommits || 0, color: 'bg-emerald-50 text-emerald-600' },
                                { label: 'This Month', value: stats.currentMonthCommits || 0, color: 'bg-purple-50 text-purple-600' },
                                { label: 'Last Month', value: stats.lastMonthCommits || 0, color: 'bg-amber-50 text-amber-600' },
                                { label: 'This Year', value: stats.yearlyCommits || 0, color: 'bg-rose-50 text-rose-600' },
                                { label: 'Weekly Active Days', value: stats.weeklyActiveDays || 0, color: 'bg-cyan-50 text-cyan-600' },
                                { label: 'Monthly Active Days', value: stats.monthlyActiveDays || 0, color: 'bg-indigo-50 text-indigo-600' },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0 font-bold text-sm`}>
                                        {item.value}
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 12-Month Contribution Calendar Heatmap */}
                <ContributionHeatmap
                    activity={activity}
                    title="GitHub Contribution Calendar"
                    subtitle="Commit activity across the last 12 months"
                    platform="github"
                    unit="commit"
                    onSync={handleSync}
                    syncing={syncing}
                />

                {/* Commit Trend Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]" ref={chartRef}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 text-sm">Commit Trend (Last 30 Days)</h3>
                        <span className="text-xs text-slate-500 font-medium">
                            Peak: <strong className="text-slate-800">{maxTrendCommits} commits/day</strong>
                        </span>
                    </div>

                    <div className="flex items-end gap-1.5 h-44 pt-6 pb-2 border-b border-slate-100">
                        {fullTrend.map((item, idx) => {
                            const barHeight = animated && item.commits > 0
                                ? Math.max(15, (item.commits / maxTrendCommits) * 100)
                                : 0;

                            return (
                                <div
                                    key={idx}
                                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                                >
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                                        <span className="font-bold text-emerald-400">{item.commits} commits</span>
                                        <span className="text-slate-300 ml-1">({item.label})</span>
                                    </div>

                                    {/* Commit number badge for active days */}
                                    {item.commits > 0 && (
                                        <span className="text-[10px] text-slate-500 mb-1 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.commits}
                                        </span>
                                    )}

                                    {/* Bar element or baseline indicator */}
                                    {item.commits > 0 ? (
                                        <div
                                            style={{
                                                height: `${barHeight}%`,
                                                transition: `height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.02}s`
                                            }}
                                            className="w-full max-w-[14px] rounded-t-md bg-gradient-to-t from-blue-600 via-indigo-500 to-indigo-400 group-hover:from-blue-700 group-hover:to-indigo-600 shadow-sm transition-[transform,box-shadow] duration-200 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-slate-400 transition-colors mb-0.5" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Timeline labels below chart */}
                    <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-2 px-1">
                        <span>{fullTrend[0]?.label || '30 days ago'}</span>
                        <span>{fullTrend[14]?.label || '15 days ago'}</span>
                        <span>{fullTrend[fullTrend.length - 1]?.label || 'Today'}</span>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default GitHubAnalyticsPage;
