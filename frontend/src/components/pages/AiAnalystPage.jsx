import React, { useState, useEffect } from 'react';
import TopNavbar from '../TopNavbar.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AiAnalystPage = () => {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    const token = localStorage.getItem('Token');

    const fetchAnalysis = async (isManual = false) => {
        if (isManual) setGenerating(true);
        else setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/ai/analyze`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error(`Failed to generate analysis (${res.status})`);
            }

            const data = await res.json();
            const result = data.data?.analysis || data.analysis || data;
            setAnalysis(result);
            if (data.analytics) setAnalytics(data.analytics);
        } catch (e) {
            console.error('AI Analyst fetch error:', e);
            setError('Unable to load AI preparation analysis. Please ensure your backend is connected.');
        } finally {
            setLoading(false);
            setGenerating(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const statusBadgeColors = {
        INTERVIEW_READY: 'bg-emerald-500 text-white',
        STRONG_PREPARATION: 'bg-indigo-600 text-white',
        NEARLY_READY: 'bg-blue-600 text-white',
        NEEDS_IMPROVEMENT: 'bg-amber-500 text-white',
        EARLY_STAGE: 'bg-slate-700 text-white'
    };

    if (loading) {
        return (
            <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <TopNavbar title="AI Analyst" subtitle="Developer Preparation Analyst" />
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-semibold text-slate-700">Analyzing your GitHub, LeetCode, and DSA metrics...</p>
                        <p className="text-xs text-slate-400 mt-1">Synthesizing full preparation status and priority roadmap</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error && !analysis) {
        return (
            <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <TopNavbar title="AI Analyst" subtitle="Developer Preparation Analyst" />
                    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                            ⚠️
                        </div>
                        <p className="text-sm font-bold text-slate-800">{error}</p>
                        <button
                            onClick={() => fetchAnalysis()}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition cursor-pointer"
                        >
                            Retry Analysis
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const prep = analysis?.preparationStatus || {};
    const gh = analysis?.github || {};
    const lc = analysis?.leetcode || {};
    const dsa = analysis?.dsa || {};

    return (
        <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <TopNavbar title="AI Preparation Analyst" subtitle="Holistic multi-platform assessment and personalized readiness roadmap" />
                    <button
                        onClick={() => fetchAnalysis(true)}
                        disabled={generating}
                        className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-70 shrink-0 self-start sm:self-center"
                    >
                        <svg className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{generating ? 'Regenerating...' : 'Refresh AI Analysis'}</span>
                    </button>
                </div>

                {/* 1. Overall Preparation Summary & 2. Current Preparation Status Hero */}
                <div className="bg-gradient-to-r from-[#11182c] via-[#1a233e] to-[#1e1a38] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-3 max-w-3xl">
                            <div className="flex items-center gap-2.5">
                                <span className="px-3 py-1 bg-white/10 backdrop-blur border border-white/10 text-indigo-300 text-xs font-bold rounded-lg uppercase tracking-wider">
                                    Executive Preparation Brief
                                </span>
                                <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg uppercase tracking-wide ${statusBadgeColors[prep.label] || 'bg-blue-600'}`}>
                                    {prep.label || 'EARLY_STAGE'}
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                {prep.summary || 'Preparation Assessment Overview'}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                                {analysis?.overallSummary || 'Complete overview of your developer readiness across platforms.'}
                            </p>
                        </div>

                        {/* Readiness Metric Circle */}
                        <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-5 text-center min-w-[160px] self-start lg:self-center shrink-0">
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Readiness Score</span>
                            <div className="text-3xl sm:text-4xl font-black text-indigo-400 my-1">
                                {prep.score !== undefined ? `${prep.score}%` : 'N/A'}
                            </div>
                            <span className="text-[10px] text-slate-300 block">Weighted Preparation</span>
                        </div>
                    </div>
                </div>

                {/* 3. Strengths & 4. Critical Gaps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Strengths */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">★</div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Demonstrated Strengths</h3>
                                <p className="text-[11px] text-slate-500">Verified strengths anchored in your actual metrics</p>
                            </div>
                        </div>
                        <ul className="space-y-2.5">
                            {(analysis?.strengths || []).map((s, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/60 text-xs text-slate-800 leading-relaxed">
                                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                    <span>{s}</span>
                                </li>
                            ))}
                            {(!analysis?.strengths || analysis.strengths.length === 0) && (
                                <li className="text-xs text-slate-400 italic">No strong areas identified yet. Consistent practice will build this profile.</li>
                            )}
                        </ul>
                    </div>

                    {/* Critical Gaps */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center font-bold">⚠️</div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Critical Preparation Gaps</h3>
                                <p className="text-[11px] text-slate-500">Areas with low coverage or activity requiring intervention</p>
                            </div>
                        </div>
                        <ul className="space-y-2.5">
                            {(analysis?.criticalGaps || analysis?.weaknesses || []).map((g, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/40 border border-rose-100/60 text-xs text-slate-800 leading-relaxed">
                                    <span className="text-rose-500 font-bold shrink-0">!</span>
                                    <span>{g}</span>
                                </li>
                            ))}
                            {(!analysis?.criticalGaps && !analysis?.weaknesses) && (
                                <li className="text-xs text-slate-400 italic">No critical gaps detected.</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* 5. GitHub, 6. LeetCode, 7. DSA Analysis Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* GitHub Breakdown */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-mono">GH</span>
                                <h4 className="text-sm font-bold text-slate-900">GitHub Engineering Pulse</h4>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                {gh.summary || 'Evaluation of repository activity, commit frequency, and development momentum.'}
                            </p>
                            {gh.strengths && gh.strengths.length > 0 && (
                                <div className="mb-3">
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Strengths</span>
                                    {gh.strengths.map((s, idx) => (
                                        <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 mb-1">
                                            <span className="text-emerald-500">•</span>
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {gh.concerns && gh.concerns.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">Points of Attention</span>
                                    {gh.concerns.map((c, idx) => (
                                        <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 mb-1">
                                            <span className="text-rose-500">•</span>
                                            <span>{c}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LeetCode Breakdown */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold font-mono">LC</span>
                                <h4 className="text-sm font-bold text-slate-900">LeetCode Problem Solving</h4>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                {lc.summary || 'Analysis of contest rating, solved counts across tiers, and streak longevity.'}
                            </p>
                            {lc.strengths && lc.strengths.length > 0 && (
                                <div className="mb-3">
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Strengths</span>
                                    {lc.strengths.map((s, idx) => (
                                        <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 mb-1">
                                            <span className="text-emerald-500">•</span>
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {lc.concerns && lc.concerns.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">Points of Attention</span>
                                    {lc.concerns.map((c, idx) => (
                                        <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 mb-1">
                                            <span className="text-rose-500">•</span>
                                            <span>{c}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DSA Breakdown */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">DSA</span>
                                <h4 className="text-sm font-bold text-slate-900">Curated DSA Sheet Readiness</h4>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                {dsa.summary || 'Weighted readiness calculation matching your target interview profile.'}
                            </p>
                            {dsa.criticalAreas && dsa.criticalAreas.length > 0 && (
                                <div className="mb-3">
                                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-1">Critical Priority</span>
                                    {dsa.criticalAreas.map((a, idx) => (
                                        <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 mb-1">
                                            <span className="text-red-500">•</span>
                                            <span>{a}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {dsa.weakTopics && dsa.weakTopics.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">Weak Topics</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {dsa.weakTopics.map((t, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded border border-rose-200">
                                                {typeof t === 'string' ? t : t.topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 8. Priority Analysis: What To Focus On Next & Why */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">🎯</div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Prioritized Focus Strategy</h3>
                            <p className="text-[11px] text-slate-500">Why certain areas take precedence over others based on current metrics</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(analysis?.priorityAnalysis || []).map((p, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-indigo-900">Priority #{idx + 1}: {p.priority}</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed mb-3">{p.reason}</p>
                                {p.basedOn && p.basedOn.length > 0 && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] text-slate-400 font-medium">Derived from:</span>
                                        {p.basedOn.map((b, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 font-mono text-[9px] rounded">
                                                {b}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 9. Recommended Actions */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">🚀</div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Concrete Next Actions</h3>
                            <p className="text-[11px] text-slate-500">Practical, specific actions directly tied to identified gaps</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {(analysis?.nextActions || []).map((action, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition">
                                <div className="flex items-start gap-3">
                                    <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold rounded-md uppercase shrink-0 mt-0.5">
                                        {action.area || 'CORE'}
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{action.action}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{action.reason}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 10. Preparation Outlook */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-indigo-400 text-sm">🔭</span>
                        <h4 className="text-sm font-bold text-white">Preparation Outlook</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {analysis?.preparationOutlook || 'Consistent problem solving on MUST-category DSA questions alongside sustained GitHub project commits creates the fastest path to interview readiness.'}
                    </p>
                </div>
            </div>
        </main>
    );
};

export default AiAnalystPage;
