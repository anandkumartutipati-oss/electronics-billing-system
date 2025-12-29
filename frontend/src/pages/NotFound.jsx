import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
                <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
                <p className="text-xl text-gray-600 mb-8">Oops! Page not found.</p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                    <Home size={20} />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )
}

export default NotFound
