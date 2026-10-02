import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Sidebar navigation component matching the login page dark theme
 * Uses NavLink for proper routing with active state highlighting
 */
const Sidebar = () => {
    const menuItems = [
        {
            to: '/dashboard',
            end: true,
            label: 'Overview',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            to: '/dashboard/github',
            label: 'GitHub Analytics',
            icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
            )
        },
        {
            to: '/dashboard/leetcode',
            label: 'LeetCode Analytics',
            icon: (
                <span className="font-mono text-xs font-bold">&lt;/&gt;</span>
            )
        },
        {
            to: '/dashboard/dsa',
            label: 'DSA Readiness',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        },
        {
            to: '/dashboard/ai',
            label: 'AI Analyst',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            )
        },
        {
            to: '/dashboard/profile',
            label: 'Profile',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            to: '/dashboard/settings',
            label: 'Settings',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
    ];

    return (
        <aside
            className="w-64 h-screen border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 select-none z-20"
            style={{ backgroundColor: '#090d1a' }}
        >
            {/* Top Brand Logo */}
            <div>
                <div className="flex items-center gap-2.5 px-2 py-3 mb-6">
                    <div className="flex items-end gap-1 h-5">
                        <span className="w-1.5 h-2.5 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full" />
                        <span className="w-1.5 h-4.5 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-full" />
                        <span className="w-1.5 h-3.5 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-full" />
                    </div>
                    <div>
                        <div className="flex items-center text-base font-extrabold tracking-tight">
                            <span className="text-white">DevProductivity</span>
                            <span className="text-indigo-400 ml-1">Hub</span>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="space-y-1.5">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end || false}
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Bottom Rocket Card */}
            <div className="rounded-2xl p-4 bg-[#11182c] border border-slate-800/80 text-left mt-6 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                    <span className="text-sm">🚀</span>
                </div>
                <h4 className="text-white font-bold text-sm tracking-tight leading-tight">
                    Track<br />Improve<br />Grow
                </h4>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-normal">
                    Become a better developer, one step at a time.
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;