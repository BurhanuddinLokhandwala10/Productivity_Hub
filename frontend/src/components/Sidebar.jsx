import React from 'react'

const Sidebar = () => {
    return (
        <div className=' border-black border-r h-full p-4 w-72 flex flex-col justify-between' style={{ "backgroundColor": "#0f1423" }}>
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5">
                <div className="flex items-end gap-1 h-3">
                    <span className="w-1 h-2 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full" />
                    <span className="w-1 h-4 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-full" />
                    <span className="w-1 h-3 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-full" />
                </div>
                <div>
                    <div className="flex items-center text-lg  font-bold tracking-tight">
                        <span className="text-white">DevProductivity</span>
                        <span className="text-indigo-400 ml-1">Hub</span>
                    </div>
                    <p className="text-[7px] font-medium tracking-widest text-slate-300/80 uppercase">
                        Track • Improve • Grow
                    </p>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 flex flex-col gap-2 mt-2">
                <ul>
                    <li className="text-white text-sm my-3">Overview</li>
                    <li className="text-white text-sm my-3">LeetCode Analytics</li>
                    <li className="text-white text-sm my-3">GitHub Analytics</li>
                    <li className="text-white text-sm my-3">DSA Readiness</li>
                    <li className="text-white text-sm my-3">AI Analyst</li>
                    <li className="text-white text-sm my-3">Profile</li>
                    <li className="text-white text-sm my-3">Settings</li>
                </ul>
            </div>
        </div>
    )
}

export default Sidebar