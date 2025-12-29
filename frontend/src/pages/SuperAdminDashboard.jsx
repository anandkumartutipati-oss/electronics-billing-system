import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { getShops, createShop, importShops, reset, deleteShop, updateShop } from '../features/shops/shopSlice'
import { getProducts } from '../features/products/productSlice'
import { getSuperAdminStats } from '../features/dashboard/dashboardSlice'
import { reset as resetAuth, updateProfile } from '../features/auth/authSlice'
import { toast } from 'react-toastify'
import { Plus, Upload, Building2, User, Phone, MapPin, Search, Package, Eye, DollarSign, AlertCircle, TrendingUp, Download, DownloadCloud } from 'lucide-react'
import ProductDetails from '../components/ProductDetails'
import ConfirmationModal from '../components/ConfirmationModal'
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import StatsCard from '../components/StatsCard'




import { useNavigate, useLocation } from 'react-router-dom'

function SuperAdminDashboard() {
    // ... existing hooks
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { user, isSuccess: authSuccess, isError: authError, message: authMessage } = useSelector((state) => state.auth)
    const { shops, isLoading, isError, message } = useSelector(
        (state) => state.shops
    )
    const { products, isLoading: isProductsLoading, isSuccess: isProductSuccess, isError: isProductError, message: productMessage } = useSelector((state) => state.products)
    const { adminStats } = useSelector((state) => state.dashboard)

    // Sync activeTab with URL
    const [activeTab, setActiveTabState] = useState('overview')
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [isProfileEditMode, setIsProfileEditMode] = useState(false)
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
        password: ''
    })

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/shops')) setActiveTabState('list');
        else if (path.includes('/products/add')) setActiveTabState('add-product');
        else if (path.includes('/products/import')) setActiveTabState('add-bulk-products');
        else if (path.includes('/products')) setActiveTabState('products');
        else if (path.includes('/users')) setActiveTabState('users');
        else if (path.includes('/add-shop')) setActiveTabState('add-single');
        else if (path.includes('/import-shops')) setActiveTabState('add-bulk');
        else if (path.includes('/overview') || path.endsWith('/superadmin') || path.endsWith('/superadmin/')) {
            setActiveTabState('overview');
            if (path.endsWith('/superadmin') || path.endsWith('/superadmin/')) {
                navigate('/superadmin/overview', { replace: true });
            }
        }
    }, [location.pathname, navigate]);

    const setActiveTab = (tab) => {
        if (tab === 'list') navigate('/superadmin/shops');
        else if (tab === 'products') navigate('/superadmin/products');
        else if (tab === 'add-product') navigate('/superadmin/products/add');
        else if (tab === 'add-bulk-products') navigate('/superadmin/products/import');
        else if (tab === 'users') navigate('/superadmin/users');
        else if (tab === 'add-single') navigate('/superadmin/add-shop');
        else if (tab === 'add-bulk') navigate('/superadmin/import-shops');
        else if (tab === 'overview') navigate('/superadmin/overview');
    };

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedShopFilter, setSelectedShopFilter] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(null)

    useEffect(() => {
        if (isError) {
            toast.error(message)
        }
        if (isProductError) {
            toast.error(productMessage)
        }
        if (isProductSuccess && productMessage) {
            toast.success(productMessage)
        }

        if (user) {
            dispatch(getShops())
            dispatch(getSuperAdminStats())
        }
        if (authError) {
            toast.error(authMessage)
            dispatch(resetAuth())
        }
        if (authSuccess && authMessage === 'Profile Updated Successfully') {
            toast.success('Profile updated successfully')
            dispatch(resetAuth())
        }

        return () => {
            // dispatch(reset()) // careful with resetting shops if sharing state
        }
    }, [user, isError, message, isProductError, isProductSuccess, productMessage, authSuccess, authError, authMessage, dispatch])

    useEffect(() => {
        if (activeTab === 'products') {
            dispatch(getProducts(selectedShopFilter))
        }
    }, [activeTab, selectedShopFilter, dispatch])


    // Form State
    const [formData, setFormData] = useState({
        shopName: '',
        shopType: 'electronics',
        name: '', // Owner Name
        email: '', // Owner Email
        password: '', // Owner Password
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    })

    const { shopName, shopType, name, email, password, phone, address, city, state, pincode } = formData

    const [isEditMode, setIsEditMode] = useState(false)
    const [editShopId, setEditShopId] = useState(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [shopToDelete, setShopToDelete] = useState(null)

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }

    const onSubmit = (e) => {
        e.preventDefault()
        const shopData = {
            shopName,
            shopType,
            ownerName: name,
            ownerEmail: email,
            ownerPassword: password,
            phone,
            address,
            city,
            state,
            pincode
        }

        if (isEditMode) {
            dispatch(updateShop({ id: editShopId, shopData }))
            setIsEditMode(false)
            setEditShopId(null)
        } else {
            dispatch(createShop(shopData))
        }

        setActiveTab('list')
        resetForm()
    }

    const resetForm = () => {
        setFormData({
            shopName: '',
            shopType: 'electronics',
            name: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            pincode: ''
        })
        setIsEditMode(false)
        setEditShopId(null)
    }

    const handleEditClick = (shop) => {
        setIsEditMode(true)
        setEditShopId(shop._id)
        setFormData({
            shopName: shop.shopName,
            shopType: shop.shopType,
            name: shop.ownerId?.name || '',
            email: shop.ownerId?.email || '',
            password: '', // Keep empty for security, or handle password update differently
            phone: shop.phone,
            address: shop.address,
            city: shop.city,
            state: shop.state,
            pincode: shop.pincode
        })
        setActiveTab('add-single')
    }

    const handleDeleteClick = (shopId) => {
        setShopToDelete(shopId)
        setDeleteModalOpen(true)
    }

    const confirmDelete = () => {
        if (shopToDelete) {
            dispatch(deleteShop(shopToDelete))
            setDeleteModalOpen(false)
            setShopToDelete(null)
        }
    }


    // Users State
    const [usersList, setUsersList] = useState([
        { _id: '1', name: 'Amit Sharma', email: 'amit@example.com', role: 'owner', shop: 'Alpha Electronics', status: 'Active' },
        { _id: '2', name: 'Rahul Verma', email: 'rahul@example.com', role: 'owner', shop: 'Beta Electricals', status: 'Active' },
        { _id: '3', name: 'Sneha Gupta', email: 'sneha@example.com', role: 'owner', shop: 'Gamma Gadgets', status: 'Active' },
        // Sample data for now, would typically come from API
    ])


    useEffect(() => {
        if (isError) {
            console.log(message)
        }
        if (user) {
            dispatch(getShops())
        }
        return () => {
            dispatch(reset())
        }
    }, [user, isError, message, dispatch])

    // Simple Filter
    const filteredShops = shops.filter((shop) =>
        (shop.shopName && shop.shopName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (shop.ownerId?.name && shop.ownerId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (shop.location && shop.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const filteredProducts = products.filter((product) =>
        (product.productName && product.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.skuCode && product.skuCode.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const filteredUsers = shops.map(shop => ({
        name: shop.ownerId?.name || 'Unknown',
        email: shop.email,
        role: 'Owner',
        shopName: shop.shopName,
        status: 'Active'
    })).filter(u =>
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.shopName && u.shopName.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors">
            {/* Sidebar Navigation */}
            <Sidebar isOpen={true} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 md:ml-64">

                {/* Unified Header */}
                <DashboardHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeTab={activeTab} toggleProfile={() => setIsProfileModalOpen(true)} />

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">

                    {/* Actions Row */}
                    <div className="flex flex-wrap gap-3 mb-6 justify-end">
                        {activeTab === 'list' && (
                            <>
                                <button
                                    onClick={() => setActiveTab('add-single')}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                                >
                                    <Plus size={20} /> Add Shop
                                </button>
                                <button
                                    onClick={() => setActiveTab('add-bulk')}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                                >
                                    <Download size={20} /> Import Shops
                                </button>
                                <button
                                    onClick={() => setActiveTab('add-bulk-products')}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                                >
                                    <Package size={20} /> Import Products
                                </button>
                            </>
                        )}
                        {activeTab === 'add-single' && (
                            <button
                                onClick={() => setActiveTab('list')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 font-medium"
                            >
                                Back to List
                            </button>
                        )}
                    </div>

                    {/* Tabs / Content Area */}

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && adminStats && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard
                                    title="Total Revenue"
                                    value={`₹${adminStats.totalRevenue?.toLocaleString() || 0}`}
                                    icon={DollarSign}
                                    color="green"
                                />
                                <StatsCard
                                    title="Active Shops"
                                    value={adminStats.totalShops}
                                    icon={Building2}
                                    color="blue"
                                />
                                <StatsCard
                                    title="Total Products"
                                    value={adminStats.totalProducts}
                                    icon={Package}
                                    color="indigo"
                                />
                                <StatsCard
                                    title="Total Suppliers"
                                    value={adminStats.totalSuppliers}
                                    icon={User}
                                    color="orange"
                                />
                            </div>

                            {/* Additional Global Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-700 dark:text-gray-300">Platform Health</h3>
                                        <TrendingUp className="text-green-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <span className="text-gray-600 dark:text-gray-400">Total Invoices Generated</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{adminStats.totalInvoices}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <span className="text-gray-600 dark:text-gray-400">Active EMI Accounts</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{adminStats.activeEMIs}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'list' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shop Details</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredShops.length > 0 ? (
                                            filteredShops.map((shop) => (
                                                <tr key={shop._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                                <Building2 size={20} />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{shop.shopName}</div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{shop.shopType}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                                            <User size={16} className="mr-2 text-gray-400 dark:text-gray-500" />
                                                            {shop.ownerId?.name || 'Unknown'}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            <Phone size={14} className="mr-2 text-gray-400 dark:text-gray-500" />
                                                            {shop.phone}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="flex items-center">
                                                            <MapPin size={16} className="mr-2 text-gray-400 dark:text-gray-500" />
                                                            {shop.city}, {shop.state}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${shop.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
                                                            {shop.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                                        <button onClick={() => handleEditClick(shop)} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4">Edit</button>
                                                        <button onClick={() => handleDeleteClick(shop._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                                    No shops found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">System Users</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Associated Shop</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredUsers.map((usr, idx) => ( // Using static list or fetched users
                                            <tr key={usr._id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3">
                                                            <User size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{usr.name}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{usr.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">{usr.role}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{usr.shopName}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                                        {usr.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Add/Edit Shop Form */}
                    {activeTab === 'add-single' && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
                            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{isEditMode ? 'Edit Shop' : 'Add New Shop'}</h2>
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shop Name</label>
                                        <input type="text" name="shopName" value={shopName} onChange={onChange} required className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shop Type</label>
                                        <select name="shopType" value={shopType} onChange={onChange} className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                            <option value="electronics">Electronics</option>
                                            <option value="electrical">Electrical</option>
                                            <option value="both">Both</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Owner Name</label>
                                        <input type="text" name="name" value={name} onChange={onChange} required className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Owner Email</label>
                                        <input type="email" name="email" value={email} onChange={onChange} required className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Owner Password</label>
                                        <input type="password" name="password" value={password} onChange={onChange} required className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shop Phone</label>
                                        <input type="tel" name="phone" value={phone} onChange={onChange} required className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                    <textarea name="address" value={address} onChange={onChange} required className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" rows="2"></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                        <input type="text" name="city" value={city} onChange={onChange} required className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                                        <input type="text" name="state" value={state} onChange={onChange} required className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
                                        <input type="text" name="pincode" value={pincode} onChange={onChange} required className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setActiveTab('list')} className="w-1/3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                                    <button type="submit" className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-colors shadow-sm">{isEditMode ? 'Update Shop' : 'Create Shop'}</button>
                                </div>
                            </form>
                        </div>
                    )}


                    {/* Bulk Import Shops UI */}
                    {activeTab === 'add-bulk' && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Bulk Import Shops</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Upload a CSV file containing Shop and Owner details.</p>

                            <div className="flex flex-col items-center justify-center">
                                <label htmlFor="file-upload" className="w-full max-w-lg flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <Download className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload CSV</span>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                const formData = new FormData()
                                                formData.append('file', e.target.files[0])
                                                dispatch(importShops(formData))
                                                setActiveTab('list') // Basic redirect, ideally show success/error modal
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800">
                                <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Required CSV Columns:</h3>
                                <code className="text-sm bg-white dark:bg-gray-900 p-2 rounded border dark:border-gray-700 block overflow-x-auto text-blue-600 dark:text-blue-300">
                                    shopName, shopType, phone, address, city, state, pincode, ownerName, ownerEmail, ownerMobile, ownerPassword
                                </code>
                            </div>

                            <button onClick={() => setActiveTab('list')} className="mt-4 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-200">Back to List</button>
                        </div>
                    )}

                    {/* Bulk Import Products UI */}
                    {activeTab === 'add-bulk-products' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold mb-4">Bulk Import Products</h2>
                            <p className="text-gray-500 mb-6">Upload a CSV file containing Product details linked to Shops via 'shopName'.</p>

                            <div className="flex flex-col items-center justify-center">
                                <label htmlFor="prod-upload" className="w-full max-w-lg flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <Package className="h-12 w-12 text-gray-400 mb-3" />
                                    <span className="text-sm text-gray-600">Click to upload Product CSV</span>
                                    <input
                                        id="prod-upload"
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                const formData = new FormData()
                                                formData.append('file', e.target.files[0])
                                                dispatch(importProducts(formData))
                                                setActiveTab('list')
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800 text-left">
                                <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <AlertCircle size={16} /> Required CSV Columns:
                                </h3>
                                <code className="text-xs bg-white dark:bg-gray-900 p-3 rounded-xl border dark:border-gray-700 block overflow-x-auto text-blue-600 dark:text-blue-300 font-mono leading-relaxed">
                                    shopName, itemType, category, brand, productName, modelNumber, skuCode, hsnCode, unit, purchasePrice, sellingPrice, gstPercent, stockQuantity, warrantyMonths, guaranteeMonths, supplierName, images
                                </code>
                                <p className="mt-3 text-[10px] text-blue-700/70 dark:text-blue-400/50 font-medium">
                                    * Separate multiple image URLs with commas. <br />
                                    * shopName: Case-sensitive name of the shop. <br />
                                    * itemType: 'electronics' or 'electrical'
                                </p>
                            </div>

                            <button onClick={() => setActiveTab('list')} className="mt-4 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors">Back to List</button>
                        </div>
                    )}

                    {/* All Products View */}
                    {activeTab === 'products' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">All Products</h2>

                                <div className="flex gap-4 w-full sm:w-auto">
                                    <select
                                        value={selectedShopFilter}
                                        onChange={(e) => setSelectedShopFilter(e.target.value)}
                                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">All Shops</option>
                                        {filteredShops.map((shop) => (
                                            <option key={shop._id} value={shop._id}>{shop.shopName}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setActiveTab('add-bulk-products')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                                    >
                                        <Upload size={16} /> Import
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shop</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredProducts && filteredProducts.length > 0 ? (
                                            filteredProducts.map((product) => (
                                                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                                                                {product.images && product.images.length > 0 ? (
                                                                    <img src={product.images[0].imageUrl || product.images[0]} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <Package size={20} className="text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{product.productName}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">{product.category}</td>
                                                    <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400 font-medium">{product.shopId?.shopName || 'Unknown'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-bold">₹{product.sellingPrice}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stockQuantity > 5 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
                                                            {product.stockQuantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center gap-1">
                                                            <Eye size={16} /> View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                                    No products found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Product Details Modal */}
                    {selectedProduct && (
                        <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} />
                    )}

                </main>
            </div>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Shop"
                message="Are you sure you want to delete this shop? This action cannot be undone and will delete all associated data."
                confirmText="Delete Shop"
                type="danger"
            />

            {/* Profile Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h2>
                            <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                ✕
                            </button>
                        </div>

                        {/* Edit Mode Toggle */}
                        {isProfileEditMode ? (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                dispatch(updateProfile(profileData));
                                setIsProfileEditMode(false);
                            }} className="space-y-4">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-md relative">
                                        {user?.name?.charAt(0) || 'U'}
                                        <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 border-2 border-white">
                                            <Upload size={12} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                                    <input type="text" name="name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="w-full mt-1 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                                    <input type="email" name="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="w-full mt-1 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile Number</label>
                                    <input type="text" name="mobile" value={profileData.mobile} onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })} className="w-full mt-1 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Password (leave blank to keep current)</label>
                                    <input type="password" name="password" value={profileData.password} onChange={(e) => setProfileData({ ...profileData, password: e.target.value })} className="w-full mt-1 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsProfileEditMode(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-xl transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-md">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                                    <p className="text-gray-900 dark:text-white font-medium text-lg border-b border-gray-100 dark:border-gray-700 pb-2">{user?.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                                    <p className="text-gray-900 dark:text-white font-medium text-lg border-b border-gray-100 dark:border-gray-700 pb-2">{user?.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile Number</label>
                                    <p className="text-gray-900 dark:text-white font-medium text-lg border-b border-gray-100 dark:border-gray-700 pb-2">{user?.mobile || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                                    <div className="mt-1">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">{user?.role}</span>
                                    </div>
                                </div>
                                <div className="pt-6 flex gap-3">
                                    <button onClick={() => {
                                        setProfileData({ name: user.name, email: user.email, mobile: user.mobile || '', password: '' });
                                        setIsProfileEditMode(true);
                                    }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-xl transition-colors">
                                        Edit Profile
                                    </button>
                                    <button onClick={() => setIsProfileModalOpen(false)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-colors">
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SuperAdminDashboard
