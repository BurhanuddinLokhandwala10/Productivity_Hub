import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import DashboardHome from '../components/DashboardHome.jsx';

const DashboardUI = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="flex flex-row h-screen w-screen overflow-hidden bg-[#f8faff] font-sans">
            <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
            <DashboardHome activeTab={activeTab} />
        </div>
    );
};

export default DashboardUI;