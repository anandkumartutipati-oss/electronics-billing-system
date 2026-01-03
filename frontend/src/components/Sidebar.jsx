import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, FileText, CreditCard, LogOut, Package, Truck, Calculator, Building2, TrendingUp, Tag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset as resetAuth } from '../features/auth/authSlice';
import { reset as resetProducts, clearProducts } from '../features/products/productSlice';
import { reset as resetShops } from '../features/shops/shopSlice';
import { reset as resetSuppliers } from '../features/suppliers/supplierSlice';
import { reset as resetEMIs } from '../features/emi/emiSlice';
import { reset as resetDashboard } from '../features/dashboard/dashboardSlice';
import { reset as resetDiscounts } from '../features/discounts/discountSlice';
import { reset as resetInvoices } from '../features/invoices/invoiceSlice';
import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';
import { useEffect } from 'react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { currentShop } = useSelector((state) => state.shops);

    // Logout Modal State
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        setLogoError(false);
    }, [currentShop?.logo]);

    const onLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        dispatch(logout());
        dispatch(resetAuth());
        dispatch(resetProducts());
        dispatch(clearProducts());
        dispatch(resetShops());
        dispatch(resetSuppliers());
        dispatch(resetEMIs());
        dispatch(resetDashboard());
        dispatch(resetDiscounts());
        dispatch(resetInvoices());
        navigate('/');
        setIsLogoutModalOpen(false);
    };

    // Helper to determine active state from path
    const isActive = (path) => {
        if (path === '/shop/overview' || path === '/superadmin/overview') {
            return location.pathname === path || location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    const ownerNavItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/shop/overview' },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/shop/analytics' },
        { id: 'products', label: 'Products', icon: ShoppingBag, path: '/shop/products' },
        { id: 'billing', label: 'New Bill (POS)', icon: Calculator, path: '/shop/billing' },
        { id: 'invoices', label: 'Invoices', icon: FileText, path: '/shop/invoices' },
        { id: 'suppliers', label: 'Suppliers', icon: Truck, path: '/shop/suppliers' },
        // { id: 'emi', label: 'EMI / Loans', icon: CreditCard, path: '/shop/emi' },
        // { id: 'discounts', label: 'Discounts', icon: Tag, path: '/shop/discounts' },
        { id: 'settings', label: 'Settings', icon: Users, path: '/shop/settings' },

    ];

    // Navigation for Super Admin
    const adminNavItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/superadmin/overview' },
        { id: 'shops', label: 'Shops', icon: Building2, path: '/superadmin/shops' },
        { id: 'products', label: 'All Products', icon: Package, path: '/superadmin/products' },
        { id: 'users', label: 'Users', icon: Users, path: '/superadmin/users' },
    ];

    const itemsToRender = user && user.role === 'superadmin' ? adminNavItems : ownerNavItems;

    return (
        <>
            <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-200 ease-in-out z-30 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white w-64 flex flex-col h-screen flex-shrink-0`}>
                <div className="flex items-center justify-center h-20 shadow-sm border-b border-gray-200 dark:border-gray-800 p-4">
                    <Link
                        to={user?.role === 'superadmin' ? '/superadmin/overview' : '/shop/overview'}
                        className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
                    >
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800 overflow-hidden flex-shrink-0">
                            {currentShop?.logo && !logoError ? (
                                <img
                                    key={currentShop.logo}
                                    src={currentShop.logo}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                                    {currentShop?.shopName?.charAt(0) || 'E'}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate leading-tight">
                                {currentShop?.shopName || 'ElectroBill'}
                            </h1>
                            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider truncate">
                                {user?.role === 'superadmin' ? 'Super Admin' : currentShop?.gstNumber ? 'GST Registered' : 'Billing System'}
                            </p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {itemsToRender.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-blue-600 dark:hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className={`mr-3 transition-colors ${isActive(item.path) ? 'text-white' : 'text-gray-500 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-white'}`} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <button onClick={onLogoutClick} className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-gray-900 rounded-md transition-colors">
                        <LogOut size={20} className="mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                confirmText="Logout"
                type="danger"
            />
        </>
    );
};

export default Sidebar;
