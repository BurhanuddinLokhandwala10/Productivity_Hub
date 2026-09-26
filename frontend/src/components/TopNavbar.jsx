import React, { useState } from 'react';

/**
 * TopNavbar component for Dashboard displaying view title, date pill, and user profile pill
 */
const TopNavbar = ({ title = "Overview", subtitle = "Your complete developer productivity snapshot" }) => {
    // Get logged-in user from localStorage or fallback to Priyanshu
    const [userName, setUserName] = useState('');
    const firstLetter = userName.charAt(0).toUpperCase();

    async function getUserDetails() {
        const response = await fetch('http://localhost:3000/auth/protected-test', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('Token')}`
            }
        });
        const data = await response.json();
        setUserName(data.user.username);
    }
    getUserDetails();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Title & Subtitle */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
            </div>

            {/* Date and User Badges */}
            <div className="flex items-center gap-3">
                {/* Date Badge */}
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200/90 bg-white shadow-xs">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-left">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Today</div>
                        <div className="text-xs font-semibold text-slate-700 leading-tight mt-0.5">Dec 29, 2024</div>
                    </div>
                </div>

                {/* User Profile Badge */}
                <div className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl bg-white border border-slate-200/90 shadow-xs">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {firstLetter}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{userName}</span>
                </div>
            </div>
        </div>
    );
};

export default TopNavbar;
