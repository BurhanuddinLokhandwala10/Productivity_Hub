import React, { useState, useEffect, useCallback } from 'react';
import TopNavbar from './TopNavbar.jsx';
import StatCard from './dashboard/StatCard.jsx';
import GithubAnalyticsCard from './dashboard/GithubAnalyticsCard.jsx';
import LeetcodeAnalyticsCard from './dashboard/LeetcodeAnalyticsCard.jsx';
import DsaReadinessCard from './dashboard/DsaReadinessCard.jsx';
import AiAnalystCard from './dashboard/AiAnalystCard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Main Overview Dashboard Home containing live metric cards, analytics cards, and AI analyst
 * All hardcoded and dummy data removed in favor of live backend PostgreSQL & Redis data
 */
const DashboardHome = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        githubScore: 0,
        githubTrend: 'STABLE',
        leetcodeProgress: 0,
        dsaReadiness: 0,
        dsaLabel: 'EARLY_STAGE',
        githubStats: {
            repositories: 0,
            currentMonthCommits: 0,
            lastMonthCommits: 0,
            activeDays: 0,
            trendScore: 0,
        },
        leetcodeStats: {
            solved: 0,
            easy: 0,
            medium: 0,
            hard: 0,
            rating: 0,
            streak: 0,
        },
        dsaStats: {
            readinessScore: 0,
            label: 'EARLY_STAGE',
            dsaDifficulty: [],
            dsaHigh: { solved: 0, total: 0, percentage: 0 },
            dsaMust: { solved: 0, total: 0, percentage: 0 },
            dsaTopics: [],
            dsaWeakTopics: [],
        },
        aiAnalysis: null
    });

    const fetchDashboardData = useCallback(async () => {
        const token = localStorage.getItem('Token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // Fetch live data from backend PostgreSQL-backed APIs
            const [ghRes, lcRes, dsaRes, aiRes] = await Promise.allSettled([
                fetch(`${API_BASE_URL}/github/progress`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/leetcode/progress`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/dsa/readiness`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/ai/analyze`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            const nextData = { ...data };

            // GitHub Live Data
            if (ghRes.status === 'fulfilled' && ghRes.value.ok) {
                const ghData = await ghRes.value.json();
                if (ghData && ghData.score !== undefined) {
                    nextData.githubScore = ghData.score;
                    nextData.githubTrend = ghData.trend || 'STABLE';
                    nextData.githubStats = {
                        repositories: ghData.repositories?.total || 0,
                        currentMonthCommits: ghData.activity?.currentMonthCommits || 0,
                        lastMonthCommits: ghData.activity?.lastMonthCommits || 0,
                        activeDays: ghData.consistency?.monthlyActiveDays || 0,
                        trendScore: ghData.trendAnalysis?.score || 0
                    };
                }
            }

            // LeetCode Live Data
            if (lcRes.status === 'fulfilled' && lcRes.value.ok) {
                const lcResData = await lcRes.value.json();
                const lcData = lcResData.progress || lcResData;
                if (lcData) {
                    const currentTotals = lcData.current || {};
                    const hasCurrent = currentTotals.totalSolved !== undefined;

                    nextData.leetcodeProgress = hasCurrent ? currentTotals.totalSolved : (lcData.totalProgress || 0);
                    nextData.leetcodeStats = {
                        solved: hasCurrent ? currentTotals.totalSolved : (lcData.totalProgress || 0),
                        easy: hasCurrent ? currentTotals.easy : (lcData.easyProgress || 0),
                        medium: hasCurrent ? currentTotals.medium : (lcData.mediumProgress || 0),
                        hard: hasCurrent ? currentTotals.hard : (lcData.hardProgress || 0),
                        rating: hasCurrent ? currentTotals.rating : (lcData.ratingDiff || 0),
                        streak: hasCurrent ? currentTotals.streak : (lcData.streakProgress || 0),
                    };
                }
            }

            // DSA Live Data
            if (dsaRes.status === 'fulfilled' && dsaRes.value.ok) {
                const dsaData = await dsaRes.value.json();
                if (dsaData && dsaData.readinessScore !== undefined) {
                    nextData.dsaReadiness = dsaData.readinessScore;
                    nextData.dsaLabel = dsaData.label || 'EARLY_STAGE';
                    nextData.dsaStats = {
                        readinessScore: dsaData.readinessScore,
                        label: dsaData.label || 'EARLY_STAGE',
                        dsaDifficulty: dsaData.difficulty || [],
                        dsaHigh: dsaData.high || { solved: 0, total: 0, percentage: 0 },
                        dsaMust: dsaData.must || { solved: 0, total: 0, percentage: 0 },
                        dsaTopics: dsaData.topics || [],
                        dsaWeakTopics: dsaData.weakTopics || [],
                    };
                }
            }

            // AI Analysis Live Data
            if (aiRes.status === 'fulfilled' && aiRes.value.ok) {
                const aiData = await aiRes.value.json();
                nextData.aiAnalysis = aiData.data?.analysis || aiData.analysis || aiData;
            }

            setData(nextData);
        } catch (err) {
            console.error('Error fetching dashboard live data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleGenerateAnalysis = async () => {
        const token = localStorage.getItem('Token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/ai/analyze`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const analysis = data.data?.analysis || data.analysis || data;
                setData(prev => ({ ...prev, aiAnalysis: analysis }));
            }
        } catch (e) {
            console.error('Failed to regenerate analysis:', e);
        }
    };

    if (loading) {
        return (
            <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <TopNavbar title="Overview" subtitle="Your complete developer productivity snapshot" />
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-xs font-semibold text-slate-500">Loading live analytics...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Navbar */}
                <TopNavbar
                    title="Overview"
                    subtitle="Live developer metrics, readiness tracking, and AI analysis"
                />

                {/* Top 3 Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* GitHub Score */}
                    <StatCard
                        icon={
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                            </svg>
                        }
                        iconBg="bg-slate-900"
                        title="GitHub Health"
                        value={data.githubScore}
                        maxVal={100}
                        statusBadge={`↗ ${data.githubTrend}`}
                        statusColor="text-emerald-600"
                        chartType="green-bars"
                    />

                    {/* LeetCode Solved */}
                    <StatCard
                        icon={
                            <span className="font-mono text-white text-sm font-bold">&lt;/&gt;</span>
                        }
                        iconBg="bg-amber-500"
                        title="LeetCode Solved"
                        value={data.leetcodeProgress}
                        maxVal={100}
                        statusBadge={data.leetcodeStats.streak > 0 ? `🔥 ${data.leetcodeStats.streak} day streak` : '● Solved Count'}
                        statusColor="text-amber-600"
                        chartType="orange-bars"
                    />

                    {/* DSA Readiness */}
                    <StatCard
                        icon={
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        }
                        iconBg="bg-purple-600"
                        title="DSA Readiness"
                        value={data.dsaReadiness}
                        statusBadge={data.dsaLabel}
                        statusColor="text-purple-600"
                        chartType="purple-wave"
                    />
                </div>

                {/* Middle Row - 3 Analytics Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* 1. GitHub Analytics */}
                    <GithubAnalyticsCard stats={data.githubStats} />

                    {/* 2. LeetCode Analytics */}
                    <LeetcodeAnalyticsCard stats={data.leetcodeStats} />

                    {/* 3. DSA Readiness */}
                    <DsaReadinessCard data={data.dsaStats} />
                </div>

                {/* Bottom Row - AI Analyst Card */}
                <div>
                    <AiAnalystCard analysis={data.aiAnalysis} onGenerate={handleGenerateAnalysis} />
                </div>
            </div>
        </main>
    );
};

export default DashboardHome;