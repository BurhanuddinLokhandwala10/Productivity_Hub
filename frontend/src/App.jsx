import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import DashboardUI from './pages/DashboardUI.jsx'
import ProtectedRoute from './pages/ProtectedRoute.jsx'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardUI />
        </ProtectedRoute>} />
    </Routes>
  )
}

export default App