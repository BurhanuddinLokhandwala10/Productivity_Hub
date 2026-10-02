import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AiAnalystCard displaying 4 insight categories (Strengths, Weaknesses, Focus Next, Recommendations)
 * Connected to live backend data with fallback
 */
const AiAnalystCard = ({ analysis, onGenerate }) => {
    const navigate = useNavigate();
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        if (onGenerate) {
            await onGenerate();
        } else {
            await new Promise(r => setTimeout(r, 800));
        }
        setGenerating(false);
    };

    const strengths = analysis?.strengths || [
        "GitHub repositories configured and tracked",
        "Curated DSA problem sheet connected"
    ];

    const weaknesses = analysis?.criticalGaps || analysis?.weaknesses || [
        "DSA MUST questions need higher completion rate",
        "LeetCode daily practice streak needs consistency"
    ];

    const focus = (analysis?.nextActions ? analysis.nextActions.map(a => a.action) : analysis?.focus) || [
        "Complete remaining DSA MUST-track problems",
        "Build daily problem-solving consistency on LeetCode",
        "Maintain active GitHub commit velocity"
    ];

    const recommendations = analysis?.recommendations || [
        "Focus primarily on MUST DSA questions before advancing to optional topics",
        "Dedicate structured practice sessions to weak DSA topics",
        "Maintain consistent code commits across active projects"
    ];

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
            {/* Header with Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">AI Preparation Analyst</h3>
                        <p className="text-xs text-slate-500">Personalized insights and recommendations based on your live developer data</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/dashboard/ai')}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-xl hover:bg-indigo-50 transition cursor-pointer"
                    >
                        Full Analysis &rarr;
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-70 shrink-0"
                    >
                        <svg className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{generating ? 'Analyzing...' : 'Generate New Analysis'}</span>
                    </button>
                </div>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {/* 1. Strengths */}
                <div className="bg-emerald-50/60 border border-emerald-100/90 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-emerald-600 text-sm">★</span>
                            <span className="font-bold text-xs text-emerald-800">Strengths</span>
                        </div>
                        <ul className="space-y-2 text-[11px] text-slate-700 leading-relaxed">
                            {strengths.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 2. Weaknesses */}
                <div className="bg-rose-50/60 border border-rose-100/90 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-rose-500 text-xs">⚠️</span>
                            <span className="font-bold text-xs text-rose-800">Critical Gaps</span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                            {weaknesses.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-rose-500 font-bold shrink-0">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 3. Focus Next */}
                <div className="bg-sky-50/60 border border-sky-100/90 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-sky-600 text-xs">🎯</span>
                            <span className="font-bold text-xs text-sky-800">Focus Next</span>
                        </div>
                        <ul className="space-y-2 text-[11px] text-slate-700 leading-relaxed">
                            {focus.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-sky-500 font-bold shrink-0">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 4. Recommendations */}
                <div className="bg-amber-50/60 border border-amber-100/90 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-amber-500 text-xs">💡</span>
                            <span className="font-bold text-xs text-amber-800">Recommendations</span>
                        </div>
                        <ul className="space-y-2 text-[11px] text-slate-700 leading-relaxed">
                            {recommendations.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-amber-500 font-bold shrink-0">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiAnalystCard;
