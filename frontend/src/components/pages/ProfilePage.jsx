import React, { useState, useEffect } from 'react';
import TopNavbar from '../TopNavbar.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [githubUsername, setGithubUsername] = useState('');
    const [leetcodeUsername, setLeetcodeUsername] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const token = localStorage.getItem('Token');

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/auth/protected-test`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                    }
                }
            } catch (e) {
                console.error('Error fetching user:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token]);

    const handleConnectPlatform = async (platform, username) => {
        if (!username.trim()) return;
        setSaving(true);
        setMessage('');
        setErrorMsg('');

        try {
            const res = await fetch(`${API_BASE_URL}/platform/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ platform, username: username.trim() })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(`Successfully linked ${platform} account: ${username}`);
                setTimeout(() => setMessage(''), 3000);
            } else {
                setErrorMsg(data.message || `Failed to connect ${platform}`);
            }
        } catch (e) {
            setErrorMsg(`Network error connecting ${platform}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="flex-1 h-screen overflow-y-auto bg-[#f8faff] p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <TopNavbar title="Developer Profile" subtitle="Manage your accounts and connected developer platforms" />

                {message && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold">
                        ✓ {message}
                    </div>
                )}

                {errorMsg && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold">
                        ⚠️ {errorMsg}
                    </div>
                )}

                {/* Profile Information */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl font-bold uppercase shadow-sm shadow-indigo-500/20">
                            {user?.username ? user.username.charAt(0) : 'D'}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{user?.username || 'Developer'}</h3>
                            <p className="text-xs text-slate-500">{user?.email || 'Authenticated User'}</p>
                            <span className="inline-block mt-2 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-semibold text-[10px] rounded-md border border-indigo-100">
                                Standard Developer Plan
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Username</label>
                            <input
                                type="text"
                                disabled
                                value={user?.username || 'Developer'}
                                className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-600 font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                disabled
                                value={user?.email || 'developer@hub.internal'}
                                className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-600 font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Connected Platforms */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                    <h3 className="text-base font-bold text-slate-900 mb-1">Connected Platforms</h3>
                    <p className="text-xs text-slate-500 mb-6">Connect your GitHub and LeetCode usernames to enable automatic synchronization and analytics</p>

                    <div className="space-y-4">
                        {/* GitHub */}
                        <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800">GitHub</h4>
                                    <p className="text-[11px] text-slate-500">Sync repositories, commit velocity, and consistency</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter GitHub username"
                                    value={githubUsername}
                                    onChange={e => setGithubUsername(e.target.value)}
                                    className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <button
                                    onClick={() => handleConnectPlatform('github', githubUsername)}
                                    disabled={saving || !githubUsername.trim()}
                                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer shrink-0"
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* LeetCode */}
                        <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-mono font-bold text-sm">
                                    &lt;/&gt;
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800">LeetCode</h4>
                                    <p className="text-[11px] text-slate-500">Sync problems solved, submission streaks, and contest rating</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter LeetCode username"
                                    value={leetcodeUsername}
                                    onChange={e => setLeetcodeUsername(e.target.value)}
                                    className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                />
                                <button
                                    onClick={() => handleConnectPlatform('leetcode', leetcodeUsername)}
                                    disabled={saving || !leetcodeUsername.trim()}
                                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer shrink-0"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;
