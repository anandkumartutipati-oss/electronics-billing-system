import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

function Navbar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const onLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            dispatch(logout())
            dispatch(reset())
            navigate('/')
        }
    }

    return (
        <nav className="bg-slate-900 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {user ? (
                            <>
                                <div className="text-gray-300 px-3 py-2 rounded-md text-base font-medium">
                                    {user.name}
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="block bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
