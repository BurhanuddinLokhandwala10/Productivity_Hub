import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import DashboardHome from '../components/DashboardHome.jsx';
import GitHubAnalyticsPage from '../components/pages/GitHubAnalyticsPage.jsx';
import LeetCodeAnalyticsPage from '../components/pages/LeetCodeAnalyticsPage.jsx';
import DsaReadinessPage from '../components/pages/DsaReadinessPage.jsx';
import AiAnalystPage from '../components/pages/AiAnalystPage.jsx';
import ProfilePage from '../components/pages/ProfilePage.jsx';
import SettingsPage from '../components/pages/SettingsPage.jsx';

const DashboardUI = () => {
    return (
        <div className="flex flex-row h-screen w-screen overflow-hidden bg-[#f8faff] font-sans">
            <Sidebar />
            <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="github" element={<GitHubAnalyticsPage />} />
                <Route path="leetcode" element={<LeetCodeAnalyticsPage />} />
                <Route path="dsa" element={<DsaReadinessPage />} />
                <Route path="ai" element={<AiAnalystPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </div>
    );
};

export default DashboardUI;