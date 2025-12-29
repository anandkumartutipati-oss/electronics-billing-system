import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-slate-900 text-gray-400 py-6 text-center text-sm">
                &copy; {new Date().getFullYear()} ElectroBill System. All rights reserved.
            </footer>
        </div>
    )
}

export default Layout
