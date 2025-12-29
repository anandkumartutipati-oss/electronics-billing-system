import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getProducts } from '../features/products/productSlice'
import { createInvoice, reset } from '../features/invoices/invoiceSlice'
import { getShop } from '../features/shops/shopSlice'
import { generateInvoicePDF } from '../utils/pdfGenerator'
import { Search, Plus, Minus, Trash2, ShoppingCart, Calculator, ArrowLeft, Printer, FileText, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

function BillingPage({ onNavigate, searchTerm }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { user } = useSelector((state) => state.auth)
    const { products } = useSelector((state) => state.products)
    const { isSuccess, isError, message, invoices } = useSelector((state) => state.invoices)
    const { currentShop } = useSelector((state) => state.shops)

    const [cart, setCart] = useState([])
    const [customer, setCustomer] = useState({ name: '', mobile: '', address: '' })
    const [paymentMode, setPaymentMode] = useState('Cash') // Cash, UPI, Card, EMI, Mixed
    const [splitPayments, setSplitPayments] = useState({
        cash: '',
        upi: '',
        card: '',
        emi: ''
    })

    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [lastInvoice, setLastInvoice] = useState(null)

    // EMI State
    const [emiDetails, setEmiDetails] = useState({
        interestRate: 0,
        tenureType: 'months',
        tenureValue: 0
    })

    useEffect(() => {
        if (!user) {
            navigate('/login')
        } else {
            dispatch(getProducts(user.shopId))

            if (user.shopId) {
                dispatch(getShop(user.shopId))
            }
        }

        // Cleanup on unmount to prevent old success state from showing modal again
        return () => {
            dispatch(reset())
        }
    }, [user, navigate, dispatch])

    useEffect(() => {
        if (isSuccess) {
            toast.success('Billing Successful!')
            if (invoices.length > 0) {
                const latest = invoices[invoices.length - 1]
                setLastInvoice(latest)
                setShowSuccessModal(true)
            }
        }
    }, [isSuccess, invoices])

    useEffect(() => {
        if (isError) {
            console.error('Billing Error:', message)
            toast.error('Billing Failed: ' + message)
            dispatch(reset())
        }
    }, [isError, message, dispatch])

    const handleReset = () => {
        setCart([])
        setCustomer({ name: '', mobile: '', address: '' })
        setPaymentMode('Cash')
        setShowSuccessModal(false)
        setLastInvoice(null)
        dispatch(reset())
    }

    const handlePrint = () => {
        if (lastInvoice) {
            // 1. Trigger Print
            generateInvoicePDF(lastInvoice, currentShop, 'print')

            // 2. Navigate to Invoices
            setTimeout(() => {
                handleGoToInvoices()
            }, 500)
        }
    }

    const handleGoToInvoices = () => {
        handleReset()
        if (onNavigate) {
            onNavigate('invoices')
        }
    }

    // Filter Products and Calculate Real-time Stock
    const filteredProducts = products.map(p => {
        const cartItem = cart.find(item => item.productId === p._id)
        const currentStock = p.stockQuantity - (cartItem ? cartItem.quantity : 0)
        return { ...p, currentStock }
    }).filter(p =>
        (p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.skuCode && p.skuCode.includes(searchTerm))) &&
        p.isActive && p.currentStock >= 0
    )

    // Cart Logic
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.productId === product._id)

        if (existingItem) {
            if (existingItem.quantity < product.stockQuantity) {
                setCart(cart.map(item =>
                    item.productId === product._id
                        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
                        : item
                ))
            } else {
                toast.warning('Stock limit reached for this item!')
            }
        } else {
            setCart([...cart, {
                productId: product._id,
                productName: product.productName,
                price: product.sellingPrice,
                gstPercent: product.gstPercent,
                quantity: 1,
                total: product.sellingPrice,
                unit: product.unit,
                stockMax: product.stockQuantity
            }])
        }
    }

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId))
    }

    const updateQuantity = (productId, delta) => {
        setCart(cart.map(item => {
            if (item.productId === productId) {
                const newQty = item.quantity + delta
                if (newQty > 0 && newQty <= item.stockMax) {
                    return { ...item, quantity: newQty, total: newQty * item.price }
                }
            }
            return item
        }))
    }

    // Calculations
    const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    const totalGST = cart.reduce((acc, item) => {
        const gstAmount = (item.price * item.quantity * item.gstPercent) / 100
        return acc + gstAmount
    }, 0)

    const grandTotal = subTotal + totalGST

    // EMI Calculation Preview
    const calculateEMI = () => {
        if (paymentMode !== 'EMI' || !emiDetails.interestRate || !emiDetails.tenureValue) return null

        const P = grandTotal
        const R = emiDetails.interestRate
        const T = emiDetails.tenureType === 'years' ? emiDetails.tenureValue : emiDetails.tenureValue / 12

        const interest = (P * R * T) / 100
        const payable = P + interest
        const months = emiDetails.tenureType === 'years' ? emiDetails.tenureValue * 12 : emiDetails.tenureValue

        return {
            monthly: Math.ceil(payable / months),
            total: payable,
            interest: interest
        }
    }
    const emiPreview = calculateEMI()

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('Cart is empty!')
            return
        }

        // Mobile Number Validation (Indian standard: 10 digits, starts with 6-9)
        const mobileRegex = /^[6-9]\d{9}$/
        if (!mobileRegex.test(customer.mobile)) {
            toast.error('Please enter a valid 10-digit mobile number starting with 6-9')
            return
        }

        if (!customer.name) {
            toast.error('Please enter customer name!')
            return
        }

        // Validate Split Payments if Mixed
        if (paymentMode === 'Mixed') {
            const totalPaid = Number(splitPayments.cash) + Number(splitPayments.upi) + Number(splitPayments.card) + Number(splitPayments.emi)
            if (Math.abs(totalPaid - grandTotal) > 1) {
                toast.error(`Payment mismatch! Total Paid: ₹${totalPaid}, Balance: ₹${grandTotal.toFixed(2)}`)
                return
            }
        }

        const invoiceData = {
            customerDetails: customer,
            items: cart,
            subTotal,
            totalGST,
            discount: 0,
            grandTotal,
            paymentType: paymentMode,
            paymentBreakdown: paymentMode === 'Mixed' ? splitPayments : {
                cash: paymentMode === 'Cash' ? grandTotal : 0,
                upi: paymentMode === 'UPI' ? grandTotal : 0,
                card: paymentMode === 'Card' ? grandTotal : 0,
                emi: paymentMode === 'EMI' ? grandTotal : 0
            },
            emiDetails: (paymentMode === 'EMI' || (paymentMode === 'Mixed' && splitPayments.emi > 0)) ? {
                ...emiDetails,
                principalAmount: paymentMode === 'EMI' ? grandTotal : splitPayments.emi
            } : null
        }

        dispatch(createInvoice(invoiceData))
    }

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white/80 dark:bg-gray-900/90 backdrop-blur-md overflow-hidden rounded-2xl border border-white/20 shadow-xl relative transition-colors duration-300">
            {/* LEFT: Product Selection */}
            <div className="w-3/5 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="text-blue-600 dark:text-blue-400" /> Products
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => addToCart(product)}
                                    className="flex flex-col items-start p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all bg-white dark:bg-gray-800 text-left group overflow-hidden"
                                >
                                    <div className="h-32 w-full bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center text-gray-400 overflow-hidden relative">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0].imageUrl || product.images[0]}
                                                alt={product.productName}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="text-4xl font-bold opacity-30">{product.productName.charAt(0)}</div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight text-sm h-10">{product.productName}</h3>
                                    <div className="flex justify-between items-center w-full mt-2">
                                        <p className={`text-xs font-bold ${product.currentStock < 5 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {product.currentStock} <span className="opacity-70 font-normal">{product.unit}s left</span>
                                        </p>
                                        <div className="font-bold text-blue-600 dark:text-blue-400">&#8377;{product.sellingPrice}</div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400">
                                <Search size={48} className="mb-4 opacity-50" />
                                <p>No products found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: Cart & Checkout */}
            <div className="w-2/5 flex flex-col bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
                {/* Customer Details */}
                <div className="bg-white/80 dark:bg-gray-800/90 p-5 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10 backdrop-blur-md">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2"><CheckCircle size={14} /> Customer Details</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            type="text"
                            placeholder="Mobile (10 digits)"
                            className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white dark:focus:bg-gray-600 transition-colors outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={customer.mobile}
                            onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                            maxLength={10}
                        />
                        <input
                            type="text"
                            placeholder="Customer Name"
                            className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white dark:focus:bg-gray-600 transition-colors outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={customer.name}
                            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Address (Optional)"
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:bg-white dark:focus:bg-gray-600 transition-colors outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    />
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {cart.length > 0 ? (
                        cart.map((item) => (
                            <div key={item.productId} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">{item.productName}</h4>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        &#8377;{item.price} x {item.quantity} | GST: {item.gstPercent}%
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg text-gray-600 dark:text-gray-300 transition-colors"><Minus size={14} /></button>
                                        <span className="w-8 text-center text-sm font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg text-gray-600 dark:text-gray-300 transition-colors"><Plus size={14} /></button>
                                    </div>
                                    <div className="w-20 text-right font-bold text-gray-900 dark:text-white">
                                        &#8377;{item.total}
                                    </div>
                                    <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500 p-1.5 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                                <ShoppingCart size={40} className="opacity-50" />
                            </div>
                            <p className="font-medium">Cart is Empty</p>
                            <p className="text-sm opacity-70">Add items to start billing</p>
                        </div>
                    )}
                </div>

                {/* Footer: Totals & Checkout */}
                <div className="bg-white/90 dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 p-5 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] backdrop-blur-md">
                    {/* Payment Mode Selection */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                        {['Cash', 'UPI', 'Card', 'EMI', 'Mixed'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => {
                                    setPaymentMode(mode)
                                    if (mode !== 'Mixed') {
                                        setSplitPayments({ cash: '', upi: '', card: '', emi: '' })
                                    }
                                }}
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-1 border ${paymentMode === mode ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/30 shadow-lg' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* Mixed Payment Inputs */}
                    {paymentMode === 'Mixed' && (
                        <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Cash Amount</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    value={splitPayments.cash}
                                    onChange={(e) => setSplitPayments({ ...splitPayments, cash: e.target.value })}
                                    onBlur={(e) => setSplitPayments({ ...splitPayments, cash: e.target.value === '' ? 0 : Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">UPI Amount</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    value={splitPayments.upi}
                                    onChange={(e) => setSplitPayments({ ...splitPayments, upi: e.target.value })}
                                    onBlur={(e) => setSplitPayments({ ...splitPayments, upi: e.target.value === '' ? 0 : Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Card Amount</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    value={splitPayments.card}
                                    onChange={(e) => setSplitPayments({ ...splitPayments, card: e.target.value })}
                                    onBlur={(e) => setSplitPayments({ ...splitPayments, card: e.target.value === '' ? 0 : Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">EMI Downpayment</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    value={splitPayments.emi}
                                    onChange={(e) => setSplitPayments({ ...splitPayments, emi: e.target.value })}
                                    onBlur={(e) => setSplitPayments({ ...splitPayments, emi: e.target.value === '' ? 0 : Number(e.target.value) })}
                                />
                            </div>
                            <div className="col-span-2 pt-2 border-t dark:border-gray-700 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase">Remaining to pay</span>
                                <span className={`text-lg font-black ${(Number(splitPayments.cash) + Number(splitPayments.upi) + Number(splitPayments.card) + Number(splitPayments.emi)) > grandTotal ? 'text-red-500' : 'text-blue-600'}`}>
                                    &#8377;{(grandTotal - (Number(splitPayments.cash) + Number(splitPayments.upi) + Number(splitPayments.card) + Number(splitPayments.emi))).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* EMI Logic Section */}
                    {(paymentMode === 'EMI' || (paymentMode === 'Mixed' && splitPayments.emi > 0)) && (
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h4 className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase mb-2 tracking-widest">EMI Configuration</h4>
                            <div className="flex gap-3 mb-3">
                                <input
                                    type="number"
                                    placeholder="Rate % (Yr)"
                                    className="w-1/2 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={emiDetails.interestRate}
                                    onChange={(e) => setEmiDetails({ ...emiDetails, interestRate: e.target.value })}
                                />
                                <div className="flex w-1/2 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 overflow-hidden">
                                    <input
                                        type="number"
                                        placeholder="Time"
                                        className="w-2/3 p-2.5 text-sm outline-none dark:bg-gray-800 dark:text-white"
                                        value={emiDetails.tenureValue}
                                        onChange={(e) => setEmiDetails({ ...emiDetails, tenureValue: e.target.value })}
                                    />
                                    <select
                                        className="w-1/3 bg-gray-50 dark:bg-gray-700 text-xs border-l dark:border-gray-700 outline-none dark:text-white"
                                        value={emiDetails.tenureType}
                                        onChange={(e) => setEmiDetails({ ...emiDetails, tenureType: e.target.value })}
                                    >
                                        <option value="months">Mo</option>
                                        <option value="years">Yr</option>
                                    </select>
                                </div>
                            </div>
                            {emiPreview && (
                                <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1.5 font-medium">
                                    <div className="flex justify-between"><span>Loan Amount:</span> <span className="font-bold">&#8377;{paymentMode === 'EMI' ? grandTotal.toFixed(2) : splitPayments.emi.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Monthly EMI:</span> <span className="font-bold">&#8377;{emiPreview.monthly}</span></div>
                                    <div className="flex justify-between"><span>Total Interest:</span> <span>&#8377;{emiPreview.interest.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Total Payable:</span> <span>&#8377;{emiPreview.total.toFixed(2)}</span></div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2 mb-5 text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span>&#8377;{subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>GST Total</span>
                            <span>&#8377;{totalGST.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black text-gray-900 dark:text-white pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 mt-2">
                            <span>Total</span>
                            <span>&#8377;{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                    >
                        <Calculator size={22} />
                        <span>PROCESS BILL</span>
                    </button>
                </div>
            </div>

            {/* SUCCESS MODAL */}
            {showSuccessModal && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md transition-all duration-500">
                    <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6 animate-bounce-short">
                        <CheckCircle size={64} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Billing Successful!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">The invoice has been created and stock updated successfully.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                        <button
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all"
                        >
                            <Printer size={20} /> Print Receipt
                        </button>
                        <button
                            onClick={handleGoToInvoices}
                            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-4 rounded-xl font-bold transition-all"
                        >
                            <FileText size={20} /> View Invoices
                        </button>
                        <button
                            onClick={handleReset}
                            className="col-span-1 md:col-span-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium py-3 transition-colors"
                        >
                            Start New Bill
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BillingPage
