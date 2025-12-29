import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getProducts, createProduct, importProducts, deleteProduct, updateProduct, reset as resetProducts } from '../features/products/productSlice'
import { getSuppliers, createSupplier, deleteSupplier, reset as resetSuppliers } from '../features/suppliers/supplierSlice'
import { getEMIs, payEMI, reset as resetEMIs } from '../features/emi/emiSlice'
import { getShopStats, getSalesGraph, getLowStockAlerts, getCategorySales, getPaymentStats, reset as resetDashboard } from '../features/dashboard/dashboardSlice'
import { reset as resetAuth, updateProfile } from '../features/auth/authSlice'
import { Plus, Upload, Package, Edit, Trash2, Phone, CreditCard, Banknote, Eye, ChevronLeft, ChevronRight, Truck, DollarSign, Users, AlertCircle, Calculator, TrendingUp, IndianRupee, Calendar, Download } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ProductDetails from '../components/ProductDetails'
import DashboardHeader from '../components/DashboardHeader'
import BillingPage from './BillingPage'
import StatsCard from '../components/StatsCard'
import SalesChart from '../components/SalesChart'
import LowStockAlert from '../components/LowStockAlert'
import PaymentChart from '../components/PaymentChart'
import CategoryChart from '../components/CategoryChart'
import InvoicesList from '../components/InvoicesList'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'

function ShopOwnerDashboard() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { user, isSuccess: authSuccess, isError: authError, message: authMessage } = useSelector((state) => state.auth)

    const { products, isSuccess, isError, message } = useSelector((state) => state.products)
    const { suppliers } = useSelector((state) => state.suppliers)
    const { emis } = useSelector((state) => state.emi)
    const { stats, salesGraph, lowStockAlerts, categorySales, paymentStats } = useSelector((state) => state.dashboard)

    // State variables
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [activeTab, setActiveTabState] = useState('overview')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)

    // EMI states
    const [showPayModal, setShowPayModal] = useState(false)
    const [paymentData, setPaymentData] = useState({ emiId: '', amount: '', remarks: '' })

    // Profile States
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [profileData, setProfileData] = useState({
        password: ''
    })

    // Date Range State for Analytics
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })

    // Sync activeTab with URL
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/products/add')) setActiveTabState('add-single');
        else if (path.includes('/products/import')) setActiveTabState('add-bulk');
        else if (path.includes('/products/edit')) setActiveTabState('add-single');
        else if (path.includes('/products')) setActiveTabState('list');
        else if (path.includes('/invoices')) setActiveTabState('invoices');
        else if (path.includes('/suppliers/add')) setActiveTabState('add-supplier');
        else if (path.includes('/suppliers')) setActiveTabState('suppliers');
        else if (path.includes('/emi')) setActiveTabState('emi');
        else if (path.includes('/billing')) setActiveTabState('billing');
        else if (path.includes('/analytics')) setActiveTabState('analytics');
        else if (path.includes('/overview') || path.endsWith('/shop') || path.endsWith('/shop/')) {
            setActiveTabState('overview');
            if (path.endsWith('/shop') || path.endsWith('/shop/')) {
                navigate('/shop/overview', { replace: true });
            }
        }
    }, [location.pathname, navigate]);

    const setActiveTab = (tab) => {
        if (tab === 'list') navigate('/shop/products');
        else if (tab === 'add-single') navigate('/shop/products/add');
        else if (tab === 'add-bulk') navigate('/shop/products/import');
        else if (tab === 'invoices') navigate('/shop/invoices');
        else if (tab === 'suppliers') navigate('/shop/suppliers');
        else if (tab === 'add-supplier') navigate('/shop/suppliers/add');
        else if (tab === 'emi') navigate('/shop/emi');
        else if (tab === 'billing') navigate('/shop/billing');
        else if (tab === 'analytics') navigate('/shop/analytics');
        else if (tab === 'overview') navigate('/shop/overview');
    };

    // Calculate Total Expenses on Products
    const totalExpenses = products.reduce((acc, p) => acc + (p.purchasePrice * p.stockQuantity), 0)

    // Product Form Data
    const [formData, setFormData] = useState({
        productName: '',
        brand: '',
        itemType: 'electronics',
        category: '',
        skuCode: '',
        hsnCode: '',
        purchasePrice: '',
        sellingPrice: '',
        gstPercent: 18,
        stockQuantity: '',
        unit: 'piece',
        warrantyMonths: '',
        guaranteeMonths: '',
        supplierId: '',
        imageUrl: '', // For manual URL entry
        images: [] // To hold existing images or newly uploaded ones
    })
    const [selectedFile, setSelectedFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    // Supplier Form Data
    const [supplierData, setSupplierData] = useState({
        supplierName: '',
        phone: '',
        gstNumber: '',
        streetAddress: '',
        city: '',
        district: '',
        pincode: '',
        landmark: '',
        state: ''
    })

    useEffect(() => {
        if (isError) {
            toast.error(message)
        }
        if (isSuccess && message) {
            toast.success(message)
        }
        if (isSuccess || isError) {
            dispatch(resetProducts())
        }

        if (authError) {
            toast.error(authMessage)
            dispatch(resetAuth())
        }
        if (authSuccess && authMessage === 'Profile Updated Successfully') { // We'll need to make sure backend or slice provides this message if we want precise toast
            toast.success('Profile updated successfully')
            dispatch(resetAuth())
        }
    }, [isSuccess, isError, message, authSuccess, authError, authMessage, dispatch])


    useEffect(() => {
        if (user) {
            if (activeTab === 'analytics') {
                dispatch(getShopStats(dateRange))
                dispatch(getCategorySales(dateRange))
                dispatch(getPaymentStats(dateRange))
                dispatch(getProducts(user.shopId))
            } else if (activeTab === 'overview') {
                dispatch(getShopStats())
                dispatch(getSalesGraph())
                dispatch(getLowStockAlerts())
                dispatch(getCategorySales())
                dispatch(getPaymentStats())
            } else if (activeTab === 'list') {
                dispatch(getProducts(user.shopId))
            } else if (activeTab === 'suppliers') {
                dispatch(getSuppliers())
            } else if (activeTab === 'emi') {
                dispatch(getEMIs())
            }
        }
    }, [dispatch, user, activeTab, dateRange])

    const filteredProducts = products.filter((product) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.skuCode && product.skuCode.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    const filteredSuppliers = suppliers.filter((s) =>
        s.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredEMIs = emis.filter((e) =>
        e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.customerMobile.includes(searchTerm)
    )

    const handleInputChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSupplierChange = (e) => {
        setSupplierData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSingleSubmit = (e) => {
        e.preventDefault()

        const productData = new FormData()
        Object.keys(formData).forEach(key => {
            if (key === 'images') {
                productData.append(key, JSON.stringify(formData[key]))
            } else {
                productData.append(key, formData[key])
            }
        })

        if (selectedFile) {
            productData.append('image', selectedFile)
        }

        if (isEditing) {
            dispatch(updateProduct({ id: editId, productData }))
            setIsEditing(false)
            setEditId(null)
        } else {
            dispatch(createProduct(productData))
        }

        setFormData({
            productName: '',
            brand: '',
            itemType: 'electronics',
            category: '',
            skuCode: '',
            hsnCode: '',
            purchasePrice: '',
            sellingPrice: '',
            gstPercent: 18,
            stockQuantity: '',
            unit: 'piece',
            warrantyMonths: '',
            guaranteeMonths: '',
            supplierId: '',
            imageUrl: '',
            images: []
        })
        setSelectedFile(null)
        setImagePreview(null)
        setActiveTab('list')
    }

    const handleSupplierSubmit = (e) => {
        e.preventDefault()

        // Phone validation
        if (!/^\d{10}$/.test(supplierData.phone)) {
            return toast.error('Phone number must be exactly 10 digits')
        }

        dispatch(createSupplier(supplierData))
        setActiveTab('suppliers')
        setSupplierData({
            supplierName: '',
            phone: '',
            gstNumber: '',
            streetAddress: '',
            city: '',
            district: '',
            pincode: '',
            landmark: '',
            state: ''
        })
    }

    const handleDeleteSupplier = (id) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            dispatch(deleteSupplier(id))
        }
    }

    const handleDeleteProduct = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            dispatch(deleteProduct(id))
        }
    }

    const handleEditProduct = (product) => {
        setFormData({
            productName: product.productName,
            brand: product.brand,
            itemType: product.itemType,
            category: product.category,
            skuCode: product.skuCode || '',
            hsnCode: product.hsnCode || '',
            purchasePrice: product.purchasePrice,
            sellingPrice: product.sellingPrice,
            gstPercent: product.gstPercent,
            stockQuantity: product.stockQuantity,
            unit: product.unit,
            warrantyMonths: product.warrantyMonths || '',
            guaranteeMonths: product.guaranteeMonths || '',
            supplierId: product.supplierId?._id || product.supplierId || '',
            imageUrl: '',
            images: product.images || []
        })
        setEditId(product._id)
        setIsEditing(true)
        if (product.images && product.images.length > 0) {
            setImagePreview(product.images[0].imageUrl || product.images[0])
        } else {
            setImagePreview(null)
        }
        setActiveTab('add-single')
    }

    const openPayModal = (emi) => {
        setPaymentData({ emiId: emi._id, amount: emi.emiAmount, remarks: '' })
        setShowPayModal(true)
    }

    const handlePaySubmit = (e) => {
        e.preventDefault()
        dispatch(payEMI({ emiId: paymentData.emiId, paymentData: { amount: paymentData.amount, remarks: paymentData.remarks } }))
        setShowPayModal(false)
        dispatch(getEMIs())
    }

    const handleProfileUpdate = (e) => {
        e.preventDefault()
        dispatch(updateProfile(profileData))
        setIsEditMode(false)
    }

    const handleProfileChange = (e) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Sidebar Navigation */}
            <Sidebar isOpen={true} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative md:ml-64 bg-transparent">

                {/* Top Header */}
                <DashboardHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    activeTab={activeTab}
                    toggleProfile={() => setIsProfileModalOpen(true)}
                />

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && stats && (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard
                                    title="Total Revenue"
                                    value={`₹${stats.monthlyRevenue?.toLocaleString() || 0}`}
                                    icon={IndianRupee}
                                    color="green"
                                    trend="up"
                                    trendValue="This Month"
                                />
                                <StatsCard
                                    title="Products in Stock"
                                    value={stats.totalStock}
                                    icon={Package}
                                    color="blue"
                                />
                                <StatsCard
                                    title="Active EMI Customers"
                                    value={stats.activeEMIs}
                                    icon={Users}
                                    color="purple"
                                />
                                <StatsCard
                                    title="Low Stock Items"
                                    value={lowStockAlerts?.length || 0}
                                    icon={AlertCircle}
                                    color="orange"
                                />
                            </div>

                            {/* Unified Row: Charts & Alerts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <SalesChart data={salesGraph} />
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <PaymentChart data={paymentStats} />
                                </div>
                                <div className="h-[400px] overflow-hidden flex flex-col">
                                    <LowStockAlert products={lowStockAlerts} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ANALYTICS TAB */}
                    {activeTab === 'analytics' && stats && (
                        <div className="space-y-6">
                            {/* Date Filter Bar */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <Calendar size={20} />
                                    <span className="text-sm font-semibold uppercase tracking-wider">Filter Period</span>
                                </div>
                                <div className="flex items-center gap-3 ml-auto">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">From</label>
                                        <input
                                            type="date"
                                            value={dateRange.startDate}
                                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                            className="bg-gray-50 dark:bg-gray-700 border-none rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">To</label>
                                        <input
                                            type="date"
                                            value={dateRange.endDate}
                                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                            className="bg-gray-50 dark:bg-gray-700 border-none rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                <StatsCard
                                    title="Total Profit"
                                    value={`₹${stats?.totalProfit?.toLocaleString() || 0}`}
                                    icon={TrendingUp}
                                    color="emerald"
                                    trend="up"
                                    trendValue="All Time"
                                />
                                <StatsCard
                                    title="Product Expenses"
                                    value={`₹${totalExpenses.toLocaleString()}`}
                                    icon={Calculator}
                                    color="orange"
                                    trend="neutral"
                                    trendValue="Current Stock Value"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <CategoryChart data={categorySales} />
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-6 text-center text-lg">Financial Performance</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col items-center text-center">
                                            <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest mb-1">Stock Value</p>
                                            <p className="text-xl font-black text-blue-600 dark:text-blue-400">₹{totalExpenses.toLocaleString()}</p>
                                            <p className="text-[9px] text-blue-500 dark:text-blue-400 mt-1 leading-tight">Total capital invested in stock.</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 flex flex-col items-center text-center">
                                            <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest mb-1">Revenue Margin</p>
                                            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                                {stats?.totalProfit ? ((stats.totalProfit / stats.monthlyRevenue) * 100).toFixed(1) : 0}%
                                            </p>
                                            <p className="text-[9px] text-emerald-500 dark:text-emerald-400 mt-1 leading-tight">Profit relative to sales volume.</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800 flex flex-col items-center text-center">
                                        <p className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-widest mb-1">Period Profit</p>
                                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">₹{stats?.totalProfit?.toLocaleString() || 0}</p>
                                        <p className="text-[10px] text-purple-500 dark:text-purple-400 mt-1">Calculated for the selected date range.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PRODUCT LIST TAB */}
                    {activeTab === 'list' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full backdrop-blur-sm">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <Package className="text-blue-600 dark:text-blue-400" /> Products Inventory
                                </h2>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setActiveTab('add-single')}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                                    >
                                        <Plus size={18} /> Add Product
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('add-bulk')}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                                    >
                                        <Download size={18} /> Import
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700 theme-table">
                                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pricing</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                        {currentProducts.length > 0 ? (
                                            currentProducts.map((product) => (
                                                <tr key={product._id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                                                                {product.images && product.images.length > 0 ? (
                                                                    <img src={product.images[0].imageUrl || product.images[0]} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <Package size={20} className="text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{product.productName}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">SKU: {product.skuCode}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">&#8377;{product.sellingPrice}</div>
                                                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">+ GST {product.gstPercent}%</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${product.stockQuantity > 5 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                                                            {product.stockQuantity} {product.unit}s
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600">{product.itemType}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(product) }} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-full transition-colors"><Eye size={18} /></button>
                                                            <button onClick={() => handleEditProduct(product)} className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"><Edit size={18} /></button>
                                                            <button onClick={() => handleDeleteProduct(product._id)} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-full transition-colors"><Trash2 size={18} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                                        <Package size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
                                                        <p className="text-lg font-medium">No products found</p>
                                                        <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or add new products.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {filteredProducts.length > itemsPerPage && (
                                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} results
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* INVOICES TAB */}
                    {activeTab === 'invoices' && (
                        <InvoicesList searchTerm={searchTerm} />
                    )}

                    {/* SUPPLIERS TAB */}
                    {activeTab === 'suppliers' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Supplier Management</h2>
                                <button
                                    onClick={() => setActiveTab('add-supplier')}
                                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 flex items-center gap-2 font-medium transition-all"
                                >
                                    <Plus size={20} /> Add New Supplier
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredSuppliers.map((supplier) => (
                                    <div key={supplier._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-100 dark:border-indigo-800">
                                                    <Truck size={20} />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{supplier.supplierName}</h3>
                                                <div className="mt-3 space-y-1">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center"><Phone size={14} className="mr-2 text-gray-400 dark:text-gray-500" /> {supplier.phone}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-700/50 inline-block px-2 py-1 rounded border border-gray-100 dark:border-gray-600 mt-1">GST: {supplier.gstNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSupplier(supplier._id)}
                                                className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {supplier.address}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* EMI TAB */}
                    {activeTab === 'emi' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><CreditCard className="text-purple-600 dark:text-purple-400" /> EMI & Loans</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage customer loan payments and schedules</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer Details</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Loan Info</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Next Due</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                        {filteredEMIs.length > 0 ? (
                                            filteredEMIs.map((emi) => (
                                                <tr key={emi._id} className="hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{emi.customerName}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1"><Phone size={12} className="mr-1" /> {emi.customerMobile}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-white font-bold">₹{emi.totalPayable.toFixed(0)}</div>
                                                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded inline-block mt-1">EMI: ₹{emi.emiAmount}/mo</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${emi.emiStatus === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                                            {emi.emiStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                        {new Date(emi.nextDueDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => openPayModal(emi)}
                                                            className="text-white bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                                                        >
                                                            <Banknote size={14} /> Record Payment
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                    No active loans found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* BILLING / POS TAB */}
                    {activeTab === 'billing' && (
                        <BillingPage searchTerm={searchTerm} onNavigate={setActiveTab} />
                    )}

                    {/* ADD SUPPLIER FORM */}
                    {activeTab === 'add-supplier' && (
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto mt-6">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Supplier</h2>
                            <form onSubmit={handleSupplierSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier Name</label>
                                        <input type="text" name="supplierName" required value={supplierData.supplierName} onChange={handleSupplierChange} placeholder="Enter supplier or company name" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                        <input type="tel" name="phone" required value={supplierData.phone} onChange={handleSupplierChange} placeholder="10-digit mobile number" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST Number (Optional)</label>
                                        <input type="text" name="gstNumber" value={supplierData.gstNumber} onChange={handleSupplierChange} placeholder="e.g. 22AAAAA0000A1Z5" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                                        <input type="text" name="streetAddress" value={supplierData.streetAddress} onChange={handleSupplierChange} placeholder="Shop No, Building Name, Street" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                        <input type="text" name="city" value={supplierData.city} onChange={handleSupplierChange} placeholder="e.g. Mumbai" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                                        <input type="text" name="district" value={supplierData.district} onChange={handleSupplierChange} placeholder="e.g. Thane" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                                        <input type="text" name="pincode" value={supplierData.pincode} onChange={handleSupplierChange} placeholder="6-digit pincode" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Landmark</label>
                                        <input type="text" name="landmark" value={supplierData.landmark} onChange={handleSupplierChange} placeholder="Near station, Opp. mall, etc" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                                        <input type="text" name="state" value={supplierData.state} onChange={handleSupplierChange} placeholder="e.g. Maharashtra" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button type="button" onClick={() => setActiveTab('suppliers')} className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium">Cancel</button>
                                    <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all">Save Supplier</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Add Single Product Form */}
                    {activeTab === 'add-single' && (
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto mt-6">
                            <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white border-b dark:border-gray-700 pb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                            <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="col-span-2">
                                    <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <input type="text" name="productName" value={formData.productName} placeholder="Product Name" required onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
                                        <input type="text" name="brand" value={formData.brand} placeholder="Brand" required onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
                                        <input type="text" name="modelNumber" value={formData.modelNumber} placeholder="Model Number" onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                                        <select name="itemType" value={formData.itemType} onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white">
                                            <option value="electronics">Electronics</option>
                                            <option value="electrical">Electrical</option>
                                        </select>
                                        <input type="text" name="category" value={formData.category} placeholder="Category" required onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
                                        <input type="text" name="skuCode" value={formData.skuCode} placeholder="SKU" required onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest border-t dark:border-gray-700 pt-6">Pricing & Inventory</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">₹</span>
                                            <input type="number" name="purchasePrice" value={formData.purchasePrice} placeholder="Purchase Price" required onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 pl-6 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">₹</span>
                                            <input type="number" name="sellingPrice" value={formData.sellingPrice} placeholder="Selling Price" required onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 pl-6 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">%</span>
                                            <input type="number" name="gstPercent" value={formData.gstPercent} placeholder="GST" required onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <input type="text" name="hsnCode" value={formData.hsnCode} placeholder="HSN Code" required onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                                        <input type="number" name="stockQuantity" value={formData.stockQuantity} placeholder="Stock Qty" required onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white" />
                                        <select name="unit" value={formData.unit} onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white">
                                            <option value="piece">Piece</option>
                                            <option value="meter">Meter</option>
                                            <option value="box">Box</option>
                                            <option value="kg">Kg</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest border-t dark:border-gray-700 pt-6">Images & Media</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Image URL</label>
                                                <input
                                                    type="text"
                                                    name="imageUrl"
                                                    value={formData.imageUrl}
                                                    placeholder="https://example.com/image.jpg"
                                                    onChange={handleInputChange}
                                                    className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white text-sm"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Upload File</label>
                                                <div className="relative group">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex items-center justify-center gap-2 group-hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700/50">
                                                        <Upload size={18} className="text-gray-400 group-hover:text-blue-500" />
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">{selectedFile ? selectedFile.name : 'Choose file...'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 min-h-[160px]">
                                            {imagePreview ? (
                                                <div className="relative group w-full h-full flex items-center justify-center">
                                                    <img src={imagePreview} alt="Preview" className="max-h-32 object-contain rounded-lg shadow-sm" />
                                                    <button
                                                        type="button"
                                                        onClick={() => { setImagePreview(null); setSelectedFile(null); setFormData(p => ({ ...p, imageUrl: '' })) }}
                                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 flex flex-col items-center gap-2">
                                                    <Package size={32} className="opacity-20" />
                                                    <span className="text-xs font-medium">Image Preview</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 flex justify-end gap-4 mt-6 pt-6 border-t dark:border-gray-700">
                                    <button type="button" onClick={() => setActiveTab('list')} className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium">Cancel</button>
                                    <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all">{isEditing ? 'Update Product' : 'Save Product'}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Bulk Import */}
                    {activeTab === 'add-bulk' && (
                        <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto mt-10 text-center">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Bulk Import Products</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Upload a CSV file to add products in bulk.</p>

                            <div className="flex flex-col items-center justify-center">
                                <label htmlFor="prod-file-upload" className="w-full max-w-lg flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl cursor-pointer bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                                    <Download className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-lg font-medium text-gray-700 dark:text-white mb-1">Click to upload CSV</span>
                                    <input
                                        id="prod-file-upload"
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

                            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800 text-left">
                                <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <AlertCircle size={16} /> Required CSV Columns:
                                </h3>
                                <code className="text-xs bg-white dark:bg-gray-900 p-3 rounded-xl border dark:border-gray-700 block overflow-x-auto text-blue-600 dark:text-blue-300 font-mono leading-relaxed">
                                    itemType, category, brand, productName, modelNumber, skuCode, hsnCode, unit, purchasePrice, sellingPrice, gstPercent, stockQuantity, warrantyMonths, guaranteeMonths, supplierName, images
                                </code>
                                <p className="mt-3 text-[10px] text-blue-700/70 dark:text-blue-400/50 font-medium">
                                    * Separate multiple image URLs with commas. <br />
                                    * itemType: 'electronics' or 'electrical'
                                </p>
                            </div>

                            <button onClick={() => setActiveTab('list')} className="mt-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">Cancel & Go Back</button>
                        </div>
                    )}

                </main>
            </div >

            {/* Modals */}
            {selectedProduct && <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} />}

            {
                showPayModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Record Payment</h3>
                            <form onSubmit={handlePaySubmit}>
                                <div className="mb-5">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-700 dark:text-white"
                                        required
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-700 dark:text-white"
                                        value={paymentData.remarks}
                                        onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowPayModal(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-400">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold">Confirm</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Profile Modal */}
            {
                isProfileModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h2>
                                <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
                            </div>

                            {isEditMode ? (
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
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
                                        <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="w-full mt-1 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                                        <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="w-full mt-1 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile Number</label>
                                        <input type="text" name="mobile" value={profileData.mobile} onChange={handleProfileChange} className="w-full mt-1 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Password (leave blank to keep current)</label>
                                        <input type="password" name="password" value={profileData.password} onChange={handleProfileChange} className="w-full mt-1 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setIsEditMode(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-xl transition-colors">
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
                                            setIsEditMode(true);
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
                )
            }
        </div >
    )
}

export default ShopOwnerDashboard