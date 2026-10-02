import React, { useState, useEffect, useCallback } from 'react';
import TopNavbar from '../TopNavbar.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DsaReadinessPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [questions, setQuestions] = useState([]);
    const [readiness, setReadiness] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [filterOptions, setFilterOptions] = useState({
        topics: [],
        difficulties: ['Easy', 'Medium', 'Hard'],
        relevances: ['MUST', 'HIGH', 'MEDIUM', 'LOW']
    });

    // Filters
    const [filterTopic, setFilterTopic] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [filterRelevance, setFilterRelevance] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const token = localStorage.getItem('Token');

    const fetchQuestionsAndProgress = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filterTopic) params.append('topic', filterTopic);
            if (filterDifficulty) params.append('difficulty', filterDifficulty);
            if (filterRelevance) params.append('relevance', filterRelevance);
            if (filterStatus) params.append('status', filterStatus);

            const queryString = params.toString() ? `?${params.toString()}` : '';
            const res = await fetch(`${API_BASE_URL}/dsa/progress${queryString}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setQuestions(data.progress || []);
                if (data.filterOptions) {
                    setFilterOptions(prev => ({
                        ...prev,
                        ...data.filterOptions
                    }));
                }
            }
        } catch (e) {
            console.error('Failed to load questions:', e);
        }
    }, [token, filterTopic, filterDifficulty, filterRelevance, filterStatus]);

    const fetchReadinessAndAnalytics = useCallback(async () => {
        try {
            const [readinessRes, analyticsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/dsa/readiness`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/dsa/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            if (readinessRes.ok) {
                const d = await readinessRes.json();
                setReadiness(d);
            }
            if (analyticsRes.ok) {
                const d = await analyticsRes.json();
                setAnalytics(d);
            }
        } catch (e) {
            console.error('Failed to load DSA analytics:', e);
        }
    }, [token]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            await Promise.all([
                fetchQuestionsAndProgress(),
                fetchReadinessAndAnalytics()
            ]);
        } catch (e) {
            setError('Unable to load DSA data.');
        } finally {
            setLoading(false);
        }
    }, [fetchQuestionsAndProgress, fetchReadinessAndAnalytics]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleStatusChange = async (questionId, newStatus) => {
        setUpdatingId(questionId);
        setSuccessMsg('');
        try {
            const res = await fetch(`${API_BASE_URL}/dsa/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ questionId, status: newStatus })
            });

            if (res.ok) {
                // Update local question state immediately for snappy UI
                setQuestions(prev =>
                    prev.map(q =>
                        q.question_id === questionId
                            ? { ...q, status: newStatus }
                            : q
                    )
                );
                setSuccessMsg(`Status updated: ${newStatus}`);
                setTimeout(() => setSuccessMsg(''), 2500);

                // Re-fetch readiness and analytics to update dashboard values
                await fetchReadinessAndAnalytics();
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.message || 'Failed to update progress');
            }
        } catch (e) {
            console.error('Update status error:', e);
        } finally {
            setUpdatingId(null);
        }
    };

    const statusColors = {
        NOT_SOLVED: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70',
        ATTEMPTED: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        SOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    };

    const activeStatusColors = {
        NOT_SOLVED: 'bg-slate-700 text-white border-slate-700 shadow-sm',
        ATTEMPTED: 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20',
        SOLVED: 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20',
    };

    const difficultyColors = {
        Easy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        Medium: 'text-amber-700 bg-amber-50 border-amber-200',
        Hard: 'text-rose-700 bg-rose-50 border-rose-200',
    };

    const relevanceColors = {
        MUST: 'text-red-700 bg-red-50 border-red-200 font-extrabold',
        HIGH: 'text-orange-700 bg-orange-50 border-orange-200 font-bold',
        MEDIUM: 'text-blue-700 bg-blue-50 border-blue-200 font-medium',
        LOW: 'text-slate-600 bg-slate-50 border-slate-200 font-normal',
        SKIP: 'text-slate-400 bg-slate-50 border-slate-200 font-normal',
    };

    // Client-side search filtering
    const displayedQuestions = questions.filter(q => {
        if (!searchQuery) return true;
        const qText = (q.question || '').toLowerCase();
        const tText = (q.topic || '').toLowerCase();
        const s = searchQuery.toLowerCase();
        return qText.includes(s) || tText.includes(s);
    });

    if (loading) {
        return (
            <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <TopNavbar title="DSA Readiness" subtitle="Your DSA preparation sheet and readiness analysis" />
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-sm text-slate-500 font-medium">Loading DSA questions & readiness...</p>
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
                    <TopNavbar title="DSA Readiness" subtitle="Your DSA preparation sheet and readiness analysis" />
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-sm text-rose-500 font-semibold">{error}</p>
                            <button onClick={fetchAll} className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer">Retry</button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <TopNavbar title="DSA Readiness" subtitle="Your curated question sheet with personal progress tracking & analytics" />

                {/* Success toast */}
                {successMsg && (
                    <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20">
                        ✓ {successMsg}
                    </div>
                )}

                {/* Readiness Summary */}
                {readiness && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Readiness Overview</h3>
                                <p className="text-xs text-slate-500">Live score based on your personal progress across {analytics?.totalQuestions || 317} questions</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-600">Target Type:</span>
                                <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg uppercase">
                                    {readiness.target || 'PRODUCT_BASED'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-indigo-900">{readiness.readinessScore}%</div>
                                <div className="text-[11px] font-medium text-slate-500 mt-1">Readiness Score</div>
                                <div className="text-[10px] text-indigo-600 font-bold mt-0.5">{readiness.label}</div>
                            </div>
                            <div className="bg-red-50/70 border border-red-100 rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-red-900">{readiness.must?.solved || 0}/{readiness.must?.total || 0}</div>
                                <div className="text-[11px] font-medium text-slate-500 mt-1">MUST Done</div>
                                <div className="text-[10px] text-red-600 font-bold mt-0.5">{readiness.must?.percentage || 0}%</div>
                            </div>
                            <div className="bg-orange-50/70 border border-orange-100 rounded-xl p-4 text-center">
                                <div className="text-2xl font-black text-orange-900">{readiness.high?.solved || 0}/{readiness.high?.total || 0}</div>
                                <div className="text-[11px] font-medium text-slate-500 mt-1">HIGH Done</div>
                                <div className="text-[10px] text-orange-600 font-bold mt-0.5">{readiness.high?.percentage || 0}%</div>
                            </div>
                            {(readiness.difficulty || []).map((d, idx) => (
                                <div key={idx} className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-black text-slate-900">{d.solved}/{d.total}</div>
                                    <div className="text-[11px] font-medium text-slate-500 mt-1">{d.difficulty}</div>
                                    <div className="text-[10px] text-slate-600 font-bold mt-0.5">{d.percentage}%</div>
                                </div>
                            ))}
                        </div>

                        {/* Weak Topics & Strengths */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
                            <div>
                                <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                                    <span className="text-rose-500">⚠️</span> Weak Topics (&lt; 50% Solved)
                                </p>
                                {readiness.weakTopics && readiness.weakTopics.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {readiness.weakTopics.map((t, idx) => (
                                            <span key={idx} className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px] rounded-lg">
                                                {t.topic} ({t.percentage}%)
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400">No weak topics identified yet.</p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                                    <span className="text-emerald-500">★</span> Strengths (&ge; 70% Solved)
                                </p>
                                {readiness.strengths && readiness.strengths.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {readiness.strengths.map((t, idx) => (
                                            <span key={idx} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] rounded-lg">
                                                {t.topic} ({t.percentage}%)
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400">Solve more problems to establish topic strengths.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search questions or topics..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        <select
                            value={filterTopic}
                            onChange={e => setFilterTopic(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">All Topics</option>
                            {filterOptions.topics.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>

                        <select
                            value={filterDifficulty}
                            onChange={e => setFilterDifficulty(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">All Difficulties</option>
                            {filterOptions.difficulties.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>

                        <select
                            value={filterRelevance}
                            onChange={e => setFilterRelevance(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">All Relevance</option>
                            {filterOptions.relevances.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>

                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">All Status</option>
                            <option value="NOT_SOLVED">Not Solved</option>
                            <option value="ATTEMPTED">Attempted</option>
                            <option value="SOLVED">Solved</option>
                        </select>

                        {(filterTopic || filterDifficulty || filterRelevance || filterStatus || searchQuery) && (
                            <button
                                onClick={() => {
                                    setFilterTopic('');
                                    setFilterDifficulty('');
                                    setFilterRelevance('');
                                    setFilterStatus('');
                                    setSearchQuery('');
                                }}
                                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
                            >
                                Clear Filters
                            </button>
                        )}

                        <span className="text-[11px] text-slate-400 font-medium ml-auto">
                            Showing {displayedQuestions.length} of {questions.length} questions
                        </span>
                    </div>
                </div>

                {/* Question Sheet Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Question</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Topic</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Difficulty</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Relevance</th>
                                    <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Your Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayedQuestions.map((q, idx) => {
                                    const currentStatus = q.status || 'NOT_SOLVED';
                                    const isUpdating = updatingId === q.question_id;
                                    return (
                                        <tr key={q.question_id} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-4 py-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-semibold text-slate-900 block">{q.question}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold rounded-md whitespace-nowrap">
                                                    {q.topic || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${difficultyColors[q.difficulty] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                                                    {q.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] border ${relevanceColors[q.relevance] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                                                    {q.relevance}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    {['NOT_SOLVED', 'ATTEMPTED', 'SOLVED'].map(s => {
                                                        const isActive = currentStatus === s;
                                                        return (
                                                            <button
                                                                key={s}
                                                                disabled={isUpdating}
                                                                onClick={() => handleStatusChange(q.question_id, s)}
                                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all duration-150 cursor-pointer disabled:opacity-50 ${
                                                                    isActive
                                                                        ? activeStatusColors[s]
                                                                        : statusColors[s]
                                                                }`}
                                                            >
                                                                {s === 'NOT_SOLVED' ? 'Not Solved' : s === 'ATTEMPTED' ? 'Attempted' : 'Solved'}
                                                            </button>
                                                        );
                                                    })}
                                                    {isUpdating && (
                                                        <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin ml-1"></div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {displayedQuestions.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-sm text-slate-500">No questions match the current filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default DsaReadinessPage;
