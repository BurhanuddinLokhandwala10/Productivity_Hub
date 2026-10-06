import React, { useState, useEffect } from 'react';
import TopNavbar from '../TopNavbar.jsx';
import ContributionHeatmap from '../common/ContributionHeatmap.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const LeetCodeAnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [progress, setProgress] = useState(null);
    const [latestSnapshot, setLatestSnapshot] = useState(null);
    const [activity, setActivity] = useState([]);

    const token = localStorage.getItem('Token');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [progressRes, summaryRes, activityRes] = await Promise.all([
                fetch(`${API_BASE_URL}/leetcode/progress`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/productivity/summary`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/leetcode/activity`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            if (progressRes.ok) {
                const d = await progressRes.json();
                setProgress(d.progress);
            }
            if (summaryRes.ok) {
                const d = await summaryRes.json();
                setLatestSnapshot(d.summary?.leetcode || null);
            }
            if (activityRes.ok) {
                const d = await activityRes.json();
                setActivity(d.activity || []);
            }
        } catch (e) {
            setError('Unable to load LeetCode analytics.');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await fetch(`${API_BASE_URL}/platform/stats?platform=leetcode`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchData();
        } catch (e) {
            // ignore
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <TopNavbar title="LeetCode Analytics" subtitle="Your problem-solving progress and statistics" />
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-sm text-slate-500 font-medium">Loading LeetCode analytics...</p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <TopNavbar title="LeetCode Analytics" subtitle="Your problem-solving progress and statistics" />
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-sm text-rose-500 font-semibold">{error}</p>
                            <button onClick={fetchData} className="mt-3 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors cursor-pointer">Retry</button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const lc = latestSnapshot || {};
    const hasProgress = progress && !progress.message;

    return (
        <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <TopNavbar title="LeetCode Analytics" subtitle="Your problem-solving progress and statistics" />

                {/* Sync button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-60"
                    >
                        <svg className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {syncing ? 'Syncing...' : 'Sync LeetCode'}
                    </button>
                </div>

                {/* Current Totals */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                    <h3 className="font-bold text-slate-800 text-sm mb-4">Current Progress</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Total Solved', value: lc.totalSolved || 0, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                            { label: 'Easy', value: lc.easySolved || 0, color: 'bg-green-50 text-green-600 border-green-100' },
                            { label: 'Medium', value: lc.mediumSolved || 0, color: 'bg-amber-50 text-amber-600 border-amber-100' },
                            { label: 'Hard', value: lc.hardSolved || 0, color: 'bg-rose-50 text-rose-600 border-rose-100' },
                            { label: 'Rating', value: lc.rating ? Math.round(lc.rating) : 0, color: 'bg-purple-50 text-purple-600 border-purple-100' },
                            { label: 'Streak', value: lc.streak || 0, color: 'bg-orange-50 text-orange-600 border-orange-100' },
                        ].map((item, idx) => (
                            <div key={idx} className={`${item.color} border rounded-xl p-4 text-center`}>
                                <div className="text-2xl font-black text-slate-900">{item.value}</div>
                                <div className="text-[11px] font-medium text-slate-500 mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 12-Month Submission Calendar Heatmap */}
                <ContributionHeatmap
                    activity={activity}
                    title="LeetCode Submission Calendar"
                    subtitle="Problem submissions across the last 12 months"
                    platform="leetcode"
                    unit="submission"
                    onSync={handleSync}
                    syncing={syncing}
                />

                {/* Progress Changes */}
                {hasProgress && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                        <h3 className="font-bold text-slate-800 text-sm mb-4">Recent Progress (vs. Previous Snapshot)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {[
                                { label: 'Total', value: progress.totalProgress || 0 },
                                { label: 'Easy', value: progress.easyProgress || 0 },
                                { label: 'Medium', value: progress.mediumProgress || 0 },
                                { label: 'Hard', value: progress.hardProgress || 0 },
                                { label: 'Rating Δ', value: progress.ratingDiff ? Math.round(progress.ratingDiff) : 0 },
                                { label: 'Streak Δ', value: progress.streakProgress || 0 },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-center">
                                    <div className={`text-2xl font-black ${item.value > 0 ? 'text-emerald-600' : item.value < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {item.value > 0 ? '+' : ''}{item.value}
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500 mt-1">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!hasProgress && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] text-center">
                        <p className="text-sm text-slate-500">
                            {progress?.message || 'Sync your LeetCode account to see progress data.'}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default LeetCodeAnalyticsPage;
