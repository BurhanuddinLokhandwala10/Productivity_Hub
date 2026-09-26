import React from 'react'
import Sidebar from '../components/Sidebar.jsx'
import DashboardHome from '../components/DashboardHome.jsx'

const DashboardUI = () => {
    return (
        <div className="flex flex-row h-screen w-screen bg-white">
            <Sidebar />
            <DashboardHome />
        </div>
    )
}

export default DashboardUI