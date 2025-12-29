import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function PrivateRoute({ allowedRoles, children }) {
    const { user } = useSelector((state) => state.auth)

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    return children ? children : <Outlet />
}

export default PrivateRoute
