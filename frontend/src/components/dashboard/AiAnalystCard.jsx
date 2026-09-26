import React, { useState } from 'react';

/**
 * AiAnalystCard displaying 4 insight categories (Strengths, Weaknesses, Focus Next, Recommendations)
 */
const AiAnalystCard = ({ onGenerate }) => {
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

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
            {/* Header with Title and Generate Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">AI Analyst</h3>
                        <p className="text-xs text-slate-500">Personalized insights and recommendations based on your developer data</p>
                    </div>
                </div>

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
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span><strong className="text-slate-800">GitHub repositories:</strong> 8 repos (score 100)</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span><strong className="text-slate-800">GitHub trend analysis:</strong> score 100 (commits increased from 0 to 5)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 2. Weaknesses */}
                <div className="bg-rose-50/60 border border-rose-100/90 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-rose-500 text-xs">⚠️</span>
                            <span className="font-bold text-xs text-rose-800">Weaknesses</span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span><strong className="text-slate-800">LeetCode:</strong> No progress (all metrics at 0)</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span><strong className="text-slate-800">DSA must-track:</strong> Only 1/101 (0.99%)</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span><strong className="text-slate-800">DSA high-level:</strong> 0/154 (0%)</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span><strong className="text-slate-800">DSA medium-level:</strong> 0/178 (0%)</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span><strong className="text-slate-800">DSA hard-level:</strong> 0/33 (0%)</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span><strong className="text-slate-800">Weak topics:</strong> Binary Search, Bit Manipulation, Design &amp; OOP, Dynamic Programming, Graphs</span>
                            </li>
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
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span>Increase LeetCode problem-solving activity</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span>Complete remaining DSA must-track problems</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span>Address weak topics: Binary Search, Bit Manipulation, Design &amp; OOP, Dynamic Programming, Graphs</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span>Enhance GitHub activity and consistency</span>
                            </li>
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
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span>Add consistent LeetCode problem solving to increase progress metrics</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span>Dedicate practice sessions to each weak topic and work through must-track problems</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-slate-400 mt-1 shrink-0">•</span>
                                <span>Boost GitHub contributions with regular commits and more active days</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiAnalystCard;
