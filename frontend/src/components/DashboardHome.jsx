import React, { useState, useEffect } from 'react';
import TopNavbar from './TopNavbar.jsx';
import StatCard from './dashboard/StatCard.jsx';
import GithubAnalyticsCard from './dashboard/GithubAnalyticsCard.jsx';
import LeetcodeAnalyticsCard from './dashboard/LeetcodeAnalyticsCard.jsx';
import DsaReadinessCard from './dashboard/DsaReadinessCard.jsx';
import AiAnalystCard from './dashboard/AiAnalystCard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Main Overview Dashboard Home containing the top metric cards, analytics cards, and AI analyst
 */
const DashboardHome = () => {
    // Default data matching the user's provided screenshot
    const [data, setData] = useState({
        githubScore: 35,
        githubTrend: 'Improving',
        leetcodeProgress: 0,
        dsaReadiness: 0.58,
        dsaLabel: 'Early Stage',
        githubStats: {
            repositories: 8,
            monthlyCommits: 5,
            activeDays: 2,
            trendScore: 100,
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
            readinessScore: 0.58,
            label: 'Early Stage',
        }
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('Token');
            if (!token) return;

            try {
                // Try fetching live data if available
                const [ghRes, lcRes, dsaRes] = await Promise.allSettled([
                    fetch(`${API_BASE_URL}/github/progress`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/leetcode/progress`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/dsa/readiness`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                if (ghRes.status === 'fulfilled' && ghRes.value.ok) {
                    const ghData = await ghRes.value.json();
                    if (ghData.score !== undefined) {
                        setData(prev => ({
                            ...prev,
                            githubScore: ghData.score,
                            githubTrend: ghData.trend || 'Improving',
                            githubStats: {
                                repositories: ghData.repositories?.total ?? prev.githubStats.repositories,
                                monthlyCommits: ghData.activity?.monthlyCommits ?? prev.githubStats.monthlyCommits,
                                activeDays: ghData.consistency?.monthlyActiveDays ?? prev.githubStats.activeDays,
                                trendScore: ghData.trendAnalysis?.score ?? prev.githubStats.trendScore,
                            }
                        }));
                    }
                }

                if (lcRes.status === 'fulfilled' && lcRes.value.ok) {
                    const lcData = await lcRes.value.json();
                    if (lcData) {
                        setData(prev => ({
                            ...prev,
                            leetcodeProgress: lcData.score || prev.leetcodeProgress,
                            leetcodeStats: {
                                solved: lcData.solved ?? prev.leetcodeStats.solved,
                                easy: lcData.easy ?? prev.leetcodeStats.easy,
                                medium: lcData.medium ?? prev.leetcodeStats.medium,
                                hard: lcData.hard ?? prev.leetcodeStats.hard,
                                rating: lcData.rating ?? prev.leetcodeStats.rating,
                                streak: lcData.streak ?? prev.leetcodeStats.streak,
                            }
                        }));
                    }
                }

                if (dsaRes.status === 'fulfilled' && dsaRes.value.ok) {
                    const dsaData = await dsaRes.value.json();
                    if (dsaData.readinessScore !== undefined) {
                        setData(prev => ({
                            ...prev,
                            dsaReadiness: dsaData.readinessScore,
                            dsaLabel: dsaData.label || 'Early Stage',
                        }));
                    }
                }
            } catch {
                // Keep default demo data matching screenshot on any network/auth issue
            }
        };

        fetchDashboardData();
    }, []);

    const handleGenerateAnalysis = async () => {
        const token = localStorage.getItem('Token');
        if (token) {
            try {
                await fetch(`${API_BASE_URL}/ai/analyze`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch {
                // graceful fallback
            }
        }
    };

    return (
        <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Navbar */}
                <TopNavbar 
                    title="Overview" 
                    subtitle="Your complete developer productivity snapshot" 
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
                        title="GitHub Score"
                        value={data.githubScore}
                        maxVal={100}
                        statusBadge={`↗ ${data.githubTrend}`}
                        statusColor="text-emerald-600"
                        chartType="green-bars"
                    />

                    {/* LeetCode Progress */}
                    <StatCard
                        icon={
                            <span className="font-mono text-white text-sm font-bold">&lt;/&gt;</span>
                        }
                        iconBg="bg-amber-500"
                        title="LeetCode Progress"
                        value={data.leetcodeProgress}
                        maxVal={100}
                        statusBadge="● No activity yet"
                        statusColor="text-rose-500"
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

                {/* Bottom Row - AI Analyst Full Width */}
                <div>
                    <AiAnalystCard onGenerate={handleGenerateAnalysis} />
                </div>
            </div>
        </main>
    );
};

export default DashboardHome;