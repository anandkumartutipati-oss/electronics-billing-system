import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Invoice from '../models/Invoice.js';
import EMI from '../models/EMI.js';
import Shop from '../models/Shop.js';
import Supplier from '../models/Supplier.js';

// @desc    Get Shop Dashboard Stats
// @route   GET /api/dashboard/stats
// @access  Private (Owner)
const getShopStats = async (req, res) => {
    try {
        const shopId = req.user.shopId;
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = { createdAt: { $gte: start, $lte: end } };
        }

        if (!shopId) {
            return res.status(400).json({ message: 'User not assigned to a shop' });
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const currentFilter = startDate && endDate ? dateFilter : { createdAt: { $gte: monthStart } };

        // 1. Total Products
        const totalProducts = await Product.countDocuments({ shopId });

        // 2. Total Stock Quantity
        const stockAgg = await Product.aggregate([
            { $match: { shopId: shopId } },
            { $group: { _id: null, totalStock: { $sum: "$stockQuantity" } } }
        ]);
        const totalStock = stockAgg.length > 0 ? stockAgg[0].totalStock : 0;

        // 3. Today's Revenue & Invoices
        const todayStats = await Invoice.aggregate([
            { $match: { shopId: shopId, ...(startDate && endDate ? dateFilter : { createdAt: { $gte: todayStart } }) } },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$grandTotal" },
                    count: { $sum: 1 },
                    itemsSold: { $sum: { $size: "$items" } } // Approximation, or unwind to sum quantity
                }
            }
        ]);

        // Better Item Sold Count
        const todayItemsAgg = await Invoice.aggregate([
            { $match: { shopId: shopId, createdAt: { $gte: todayStart } } },
            { $unwind: "$items" },
            { $group: { _id: null, totalQty: { $sum: "$items.quantity" } } }
        ]);

        const todayRevenue = todayStats.length > 0 ? todayStats[0].revenue : 0;
        const todayInvoices = todayStats.length > 0 ? todayStats[0].count : 0;
        const todayItemsSold = todayItemsAgg.length > 0 ? todayItemsAgg[0].totalQty : 0;


        // 4. Monthly Revenue
        const monthStats = await Invoice.aggregate([
            { $match: { shopId: shopId, ...currentFilter } },
            { $group: { _id: null, revenue: { $sum: "$grandTotal" } } }
        ]);
        const monthlyRevenue = monthStats.length > 0 ? monthStats[0].revenue : 0;

        // 5. EMI Stats
        const activeEMIs = await EMI.countDocuments({ shopId, emiStatus: 'Active' });

        // Pending EMI Amount (Total Payable of Active EMIs - this is rough, ideally subtract payments)
        // For now, assuming Total Payable as pending if we don't track payments separately yet
        const emiPendingAgg = await EMI.aggregate([
            { $match: { shopId: shopId, emiStatus: 'Active' } },
            { $group: { _id: null, total: { $sum: "$totalPayable" } } }
        ]);
        const pendingEMIAmount = emiPendingAgg.length > 0 ? emiPendingAgg[0].total : 0;

        // 6. Total Profit Calculation (Estimate based on current purchase price)
        const profitAgg = await Invoice.aggregate([
            { $match: { shopId: shopId, ...(startDate && endDate ? dateFilter : {}) } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    quantity: "$items.quantity",
                    sellingPrice: "$items.price",
                    purchasePrice: { $ifNull: ["$productDetails.purchasePrice", 0] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalProfit: {
                        $sum: {
                            $multiply: [
                                { $subtract: ["$sellingPrice", "$purchasePrice"] },
                                "$quantity"
                            ]
                        }
                    }
                }
            }
        ]);
        const totalProfit = profitAgg.length > 0 ? profitAgg[0].totalProfit : 0;

        res.json({
            totalProducts,
            totalStock,
            todayRevenue,
            todayInvoices,
            todayItemsSold,
            monthlyRevenue,
            activeEMIs,
            pendingEMIAmount,
            totalProfit
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get Sales Graph Data (Last 30 Days)
// @route   GET /api/dashboard/graph
// @access  Private (Owner)
const getSalesGraph = async (req, res) => {
    try {
        const shopId = req.user.shopId;
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - 30);

        const sales = await Invoice.aggregate([
            {
                $match: {
                    shopId: shopId,
                    createdAt: { $gte: dateLimit }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$grandTotal" },
                    invoices: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Low Stock Alerts
// @route   GET /api/dashboard/alerts
// @access  Private (Owner)
const getLowStockAlerts = async (req, res) => {
    try {
        const shopId = req.user.shopId;
        const threshold = 5; // Configurable later

        // Using populate to get supplier name if needed (Product has supplierId ref)
        const products = await Product.find({
            shopId: shopId,
            stockQuantity: { $lte: threshold }
        }).populate('supplierId', 'supplierName phone');

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Super Admin Global Stats
// @route   GET /api/dashboard/admin/stats
// @access  Private (SuperAdmin)
const getSuperAdminStats = async (req, res) => {
    try {
        const { shopId } = req.query;
        let filter = {};
        if (shopId) {
            filter.shopId = shopId;
        }

        const totalShops = await Shop.countDocuments();
        const totalProducts = await Product.countDocuments(filter);
        const lowStockProducts = await Product.countDocuments({ ...filter, stockQuantity: { $lte: 5 } });
        const totalSuppliers = await Supplier.countDocuments(filter);

        // precise revenue aggregation across all shops
        const revenueAgg = await Invoice.aggregate([
            { $match: (shopId && mongoose.Types.ObjectId.isValid(shopId)) ? { shopId: new mongoose.Types.ObjectId(shopId) } : {} },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$grandTotal" },
                    totalInvoices: { $sum: 1 },
                    totalItemsSold: { $sum: { $reduce: { input: "$items", initialValue: 0, in: { $add: ["$$value", "$$this.quantity"] } } } }
                }
            }
        ]);

        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
        const totalInvoices = revenueAgg.length > 0 ? revenueAgg[0].totalInvoices : 0;
        const totalItemsSold = revenueAgg.length > 0 ? revenueAgg[0].totalItemsSold : 0;

        const activeEMIs = await EMI.countDocuments({ ...filter, emiStatus: 'Active' });

        // Total Unique Customers (based on mobile number)
        const customerAgg = await Invoice.aggregate([
            { $match: (shopId && mongoose.Types.ObjectId.isValid(shopId)) ? { shopId: new mongoose.Types.ObjectId(shopId) } : {} },
            { $group: { _id: "$customerDetails.mobile" } },
            { $count: "count" }
        ]);
        const totalCustomers = customerAgg.length > 0 ? customerAgg[0].count : 0;

        res.json({
            totalShops,
            totalProducts,
            lowStockProducts,
            totalRevenue,
            totalInvoices,
            totalSuppliers,
            activeEMIs,
            totalCustomers,
            totalItemsSold
        });
    } catch (error) {
        console.error('SuperAdminStats Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get Category Sales Stats (Pie/Bar Chart)
// @route   GET /api/dashboard/category-sales
// @access  Private (Owner)
const getCategorySales = async (req, res) => {
    try {
        const shopId = req.user.shopId;
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = { createdAt: { $gte: start, $lte: end } };
        }

        const stats = await Invoice.aggregate([
            { $match: { shopId: shopId, ...dateFilter } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    category: { $ifNull: ["$productDetails.category", "Uncategorized"] },
                    total: "$items.total",
                    quantity: "$items.quantity"
                }
            },
            {
                $group: {
                    _id: "$category",
                    totalSales: { $sum: "$total" },
                    count: { $sum: "$quantity" }
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: 6 }
        ]);

        // Also group by specific Category string if needed
        const categorySpecific = await Invoice.aggregate([
            { $match: { shopId: shopId, ...dateFilter } },
            { $unwind: "$items" },
            {
                // We need to lookup product to get true category string if not stored in invoice item
                // However, invoice itmes usually snapshot important data. Let's check Invoice model again.
                // Invoice items has 'productName', 'modelNumber'. It might not have 'category'.
                // If not, we rely on 'itemType' or join Product.
                // For now, let's assume we used itemType as the high-level split.
                $group: {
                    _id: "$items.productName", // Fallback to top products if category missing
                    revenue: { $sum: "$items.total" }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            byType: stats,
            topProducts: categorySpecific
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get Payment Mode Stats (Pie Chart)
// @route   GET /api/dashboard/payment-stats
// @access  Private (Owner)
const getPaymentStats = async (req, res) => {
    try {
        const shopId = req.user.shopId;
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = { createdAt: { $gte: start, $lte: end } };
        }

        const stats = await Invoice.aggregate([
            { $match: { shopId: shopId, ...dateFilter } },
            {
                $group: {
                    _id: "$paymentType",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$grandTotal" }
                }
            }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

export {
    getShopStats,
    getSalesGraph,
    getLowStockAlerts,
    getSuperAdminStats,
    getCategorySales,
    getPaymentStats
};
