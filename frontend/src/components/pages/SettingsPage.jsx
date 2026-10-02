import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../TopNavbar.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [targetType, setTargetType] = useState('PRODUCT_BASED');
    const [savingTarget, setSavingTarget] = useState(false);
    const [syncingGh, setSyncingGh] = useState(false);
    const [syncingLc, setSyncingLc] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState('');

    const token = localStorage.getItem('Token');

    useEffect(() => {
        const fetchTarget = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/dsa/target`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.target) setTargetType(data.target);
                }
            } catch (e) {
                console.error('Failed to load target:', e);
            }
        };

        fetchTarget();
    }, [token]);

    const handleSaveTarget = async (newTarget) => {
        setTargetType(newTarget);
        setSavingTarget(true);
        setFeedbackMsg('');
        try {
            const res = await fetch(`${API_BASE_URL}/dsa/target`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ targetType: newTarget })
            });
            if (res.ok) {
                setFeedbackMsg(`Preparation track updated to ${newTarget === 'PRODUCT_BASED' ? 'Product-Based' : 'Service-Based'}`);
                setTimeout(() => setFeedbackMsg(''), 3000);
            }
        } catch (e) {
            console.error('Failed to update target:', e);
        } finally {
            setSavingTarget(false);
        }
    };

    const handleManualSync = async (platform) => {
        if (platform === 'github') setSyncingGh(true);
        if (platform === 'leetcode') setSyncingLc(true);
        setFeedbackMsg('');

        try {
            const res = await fetch(`${API_BASE_URL}/platform/stats?platform=${platform}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setFeedbackMsg(`${platform.toUpperCase()} synced successfully! Analytics updated.`);
            } else {
                setFeedbackMsg(data.message || `Sync failed for ${platform}`);
            }
        } catch (e) {
            setFeedbackMsg(`Failed to sync ${platform}`);
        } finally {
            if (platform === 'github') setSyncingGh(false);
            if (platform === 'leetcode') setSyncingLc(false);
            setTimeout(() => setFeedbackMsg(''), 3500);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('Token');
        navigate('/login');
    };

    return (
        <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <TopNavbar title="Settings" subtitle="Configure interview goals, sync frequencies, and preferences" />

                {feedbackMsg && (
                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-xl text-xs font-semibold">
                        ✓ {feedbackMsg}
                    </div>
                )}

                {/* Target Track */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Interview Preparation Target</h3>
                    <p className="text-xs text-slate-500 mb-4">Adjusts the weighted formula used to compute your DSA readiness score</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={() => handleSaveTarget('PRODUCT_BASED')}
                            disabled={savingTarget}
                            className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                                targetType === 'PRODUCT_BASED'
                                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                                    : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-900">Product-Based Companies</span>
                                {targetType === 'PRODUCT_BASED' && <span className="text-indigo-600 text-xs font-bold">✓ Active</span>}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Weighted heavily on MUST problems (50%), HIGH (20%), Topic breadth (20%), Difficulty (10%).
                            </p>
                        </button>

                        <button
                            onClick={() => handleSaveTarget('SERVICE_BASED')}
                            disabled={savingTarget}
                            className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                                targetType === 'SERVICE_BASED'
                                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                                    : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-900">Service-Based Companies</span>
                                {targetType === 'SERVICE_BASED' && <span className="text-indigo-600 text-xs font-bold">✓ Active</span>}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                MUST problems (40%), Topic coverage (25%), HIGH (20%), Difficulty (15%).
                            </p>
                        </button>
                    </div>
                </div>

                {/* Platform Sync Operations */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Data Synchronization</h3>
                    <p className="text-xs text-slate-500 mb-4">
                        Automatic background sync runs every 6 hours via BullMQ worker. You can also trigger an immediate manual refresh.
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                                <span className="text-xs font-bold text-slate-800 block">GitHub Sync</span>
                                <span className="text-[11px] text-slate-500">Fetches latest commits, active days, and repositories</span>
                            </div>
                            <button
                                onClick={() => handleManualSync('github')}
                                disabled={syncingGh}
                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
                            >
                                {syncingGh ? 'Syncing...' : 'Sync Now'}
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                                <span className="text-xs font-bold text-slate-800 block">LeetCode Sync</span>
                                <span className="text-[11px] text-slate-500">Fetches problem counts, streaks, and contest snapshots</span>
                            </div>
                            <button
                                onClick={() => handleManualSync('leetcode')}
                                disabled={syncingLc}
                                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
                            >
                                {syncingLc ? 'Syncing...' : 'Sync Now'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Session & Account */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Session Management</h3>
                    <p className="text-xs text-slate-500 mb-4">Sign out of your Developer Productivity Hub account on this device</p>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;
