import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../Pages/Home'
import Dashboard from '../Pages/Dashboard'
import Login from '../Pages/Login'
import Signup from '../Pages/Signup'
import Content from '../Pages/Content'
import ContentPost from '../Pages/ContentPost'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminDashboard from '../Pages/Admin/AdminDashboard'
import UserManagement from '../Pages/Admin/UserManagement'
import Analytics from '../Pages/Admin/Analytics'
import ResetPassword from '../Pages/ResetPassword'
import ContentEditor from '../Components/ContentEditor'
import ContentManagement from '../Pages/Admin/ContentManagement'
import TermsOfService from '../Pages/TermsOfService'
import PolicyPage from '../Pages/PolicyPage'

const Navroutes = () => {
  return (
    <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/content" element={<Content />} />
        <Route path="/content/:id" element={<ContentPost />} />
        <Route path='/create-content' element={<ContentEditor />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PolicyPage />} />
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requireAdmin={true}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/content" element={
          <ProtectedRoute requireAdmin={true}>
            <ContentManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute requireAdmin={true}>
            <Analytics />
          </ProtectedRoute>
        } />
    </Routes>
  )
}

export default Navroutes