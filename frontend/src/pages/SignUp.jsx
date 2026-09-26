import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from "../assets/Login_Signup_Bg.png";

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email.trim() || !formData.password.trim()) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed. Please check your credentials.');
            }

            if (data.Token) {
                localStorage.setItem('Token', data.Token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-between p-4 sm:p-6 lg:p-8 xl:p-10 font-sans"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundColor: '#070a18',
                backgroundSize: 'cover',
                backgroundPosition: 'left top',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Left Hero Content - Positioned in the upper region to leave the laptop and badges unobstructed */}
            <div className="relative z-10 hidden lg:flex flex-col max-w-sm select-none pl-2 xl:pl-4 self-start pt-2 xl:pt-4">
                {/* Brand / Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="flex items-end gap-1 h-5">
                        <span className="w-1.5 h-2.5 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full" />
                        <span className="w-1.5 h-4.5 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-full" />
                        <span className="w-1.5 h-3.5 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-full" />
                    </div>
                    <div>
                        <div className="flex items-center text-base xl:text-lg font-bold tracking-tight">
                            <span className="text-white">DevProductivity</span>
                            <span className="text-indigo-400 ml-1">Hub</span>
                        </div>
                        <p className="text-[9px] font-medium tracking-widest text-slate-300/80 uppercase">
                            Track • Improve • Grow
                        </p>
                    </div>
                </div>

                {/* Headline */}
                <div className="mt-5 xl:mt-6">
                    <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
                        Become a<br />
                        Better Developer<br />
                        <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                            Every Day
                        </span>
                    </h1>
                    <p className="mt-2.5 text-xs text-slate-300/80 leading-relaxed max-w-xs font-normal">
                        Track your GitHub activity, solve more problems, build consistency and unlock your full potential.
                    </p>
                </div>
            </div>

            {/* Bottom Quote & Indicator - Anchored at the bottom below the laptop */}
            <div className="absolute bottom-3 left-6 xl:left-10 hidden lg:flex flex-col items-center select-none z-10 pointer-events-none">
                <p className="text-[10px] text-slate-400/90 font-medium italic text-center leading-tight">
                    “A more productive you,<br />for a brighter tomorrow.”
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-5 h-0.5 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500/50" />
                    <span className="w-1 h-0.5 bg-slate-600 rounded-full" />
                    <span className="w-1 h-0.5 bg-slate-600 rounded-full" />
                </div>
            </div>

            {/* Right Login Card */}
            <div className="relative z-10 w-full lg:w-auto flex justify-center lg:justify-end lg:pr-4 xl:pr-8">
                <div className="w-full max-w-[460px] sm:w-[450px] bg-white rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-indigo-950/30 p-7 sm:p-9 xl:p-10 border border-slate-100/80 transition-all">

                    {/* Header */}
                    <div className="text-left">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Create Your Account
                        </h2>
                        <p className="text-sm text-slate-500 mt-1.5">
                            Join thousands of developers tracking their growth
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-600 flex items-start gap-2 animate-fadeIn">
                            <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="leading-tight">{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        {/* Username Input */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5" htmlFor="username">
                                Username
                            </label>
                            <div className="relative flex items-center rounded-xl border border-slate-200/90 bg-slate-50/40 hover:border-slate-300 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/70 transition-all duration-150">
                                <span className="pl-3.5 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    required
                                    className="w-full py-2.5 sm:py-3 pl-2.5 pr-4 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none rounded-xl"
                                />
                            </div>
                        </div>
                        {/* Email Input */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5" htmlFor="email">
                                Email
                            </label>
                            <div className="relative flex items-center rounded-xl border border-slate-200/90 bg-slate-50/40 hover:border-slate-300 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/70 transition-all duration-150">
                                <span className="pl-3.5 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full py-2.5 sm:py-3 pl-2.5 pr-4 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5" htmlFor="password">
                                Password
                            </label>
                            <div className="relative flex items-center rounded-xl border border-slate-200/90 bg-slate-50/40 hover:border-slate-300 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/70 transition-all duration-150">
                                <span className="pl-3.5 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full py-2.5 sm:py-3 pl-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all duration-200 shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                            ) : (
                                <>
                                    <span>Sign Up</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer - Sign up Link */}
                    <div className="mt-8 text-center text-xs sm:text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                            Log In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp