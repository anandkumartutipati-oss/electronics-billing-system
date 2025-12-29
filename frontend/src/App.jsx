import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import ShopOwnerDashboard from './pages/ShopOwnerDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import BillingPage from './pages/BillingPage'
import NotFound from './pages/NotFound'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'

// Layout Component
function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    )
}

// Role Based Dashboard Redirector
function DashboardRedirect() {
    const { user } = useSelector((state) => state.auth)

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role === 'superadmin') {
        return <Navigate to="/superadmin/overview" replace />
    }

    if (user.role === 'owner' || user.role === 'staff') {
        return <Navigate to="/shop/overview" replace />
    }

    return <Navigate to="/login" replace />
}

import ErrorBoundary from './components/ErrorBoundary'

// ... existing imports ...

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ErrorBoundary>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/landing" element={<Navigate to="/" replace />} />
                    <Route path="/login" element={<Login />} />

                    {/* Dashboard Routes (Standalone, No Public Layout) */}
                    <Route path="/superadmin/*" element={
                        <PrivateRoute allowedRoles={['superadmin']}>
                            <SuperAdminDashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/shop/*" element={
                        <PrivateRoute allowedRoles={['owner', 'staff']}>
                            <ShopOwnerDashboard />
                        </PrivateRoute>
                    } />

                    {/* Routing to Main Dashboard logic */}
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <DashboardRedirect />
                        </PrivateRoute>
                    } />

                    {/* Independent Protected Routes */}

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <ToastContainer position="top-right" autoClose={3000} />
            </ErrorBoundary>
        </Router>
    )
}

export default App
