import { Search, User, LogOut, Moon, Sun } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'react-router-dom';

const DashboardHeader = ({ searchTerm, setSearchTerm, toggleProfile }) => {
    const { user } = useSelector((state) => state.auth);
    const { currentShop } = useSelector((state) => state.shops);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const getPlaceholder = () => {
        const path = location.pathname;
        if (path.includes('/billing')) return "Search products by name, SKU or scan barcode...";
        if (path.includes('/invoices')) return "Search by customer name, mobile or invoice number...";
        if (path.includes('/products')) return "Search products by name, brand or SKU...";
        if (path.includes('/shops')) return "Search shops by name, owner or location...";
        if (path.includes('/users')) return "Search users by name or email...";
        if (path.includes('/suppliers')) return "Search suppliers by name or phone...";
        if (path.includes('/emi')) return "Search loans by customer name or phone...";
        return "Search...";
    };

    const getTitle = () => {
        const path = location.pathname;
        if (path.includes('/overview') || path.endsWith('/dashboard')) return "Overview";
        if (path.includes('/products')) return "Products Portfolio";
        if (path.includes('/shops')) return "Shops Directory";
        if (path.includes('/users')) return "Users Management";
        if (path.includes('/invoices')) return "Invoices History";
        if (path.includes('/suppliers')) return "Suppliers List";
        if (path.includes('/emi')) return "EMI & Loans";
        if (path.includes('/billing')) return "New Billing";
        if (path.includes('/add-shop')) return "Register New Shop";
        if (path.includes('/import')) return "Bulk Import";
        return "Dashboard";
    };

    return (
        <header className="bg-white dark:bg-black shadow-sm h-20 flex items-center justify-between px-8 py-4 z-10 border-b border-gray-200 dark:border-gray-800 transition-colors">
            {/* Page Title */}
            <div className="hidden lg:block mr-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap">{getTitle()}</h2>
            </div>

            {/* Search Bar */}
            <div className="relative w-full max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder={getPlaceholder()}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
                />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 ml-4">

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* User Profile */}
                <div onClick={toggleProfile} className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700 cursor-pointer">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user ? user.name : 'User'}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{currentShop?.shopName || (user?.role === 'owner' ? 'Shop Owner' : 'Staff')}</p>
                    </div>
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
