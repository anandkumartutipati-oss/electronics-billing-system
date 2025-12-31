import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import EMI from '../models/EMI.js';
// const StockLog = require('../models/StockLog'); // TODO: Add stock logging later

// @desc    Create a new Invoice
// @route   POST /api/invoices
// @access  Private (Owner/Staff)
const createInvoice = async (req, res) => {
    try {
        const {
            customerDetails,
            items,
            subTotal,
            totalGST,
            discount,
            grandTotal,
            paymentType,
            paymentBreakdown, // New: { cash, upi, card, emi }
            emiDetails // Optional: { principal, interest, tenureType, tenureValue, ... }
        } = req.body;

        if (!req.user.shopId) {
            return res.status(400).json({ message: 'User not assigned to a shop' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in cart' });
        }

        // 1. Validate Stock and Calculate Totals (Double check)
        // Ideally verify prices here too, but for now trust frontend for speed, check stock mostly
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.productName}` });
            }
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for: ${product.productName}. Available: ${product.stockQuantity}` });
            }
        }

        // 2. Generate Invoice Number (Simple sequential per shop could be complex, using Timestamp for now)
        // OR better: count docs for this shop
        const count = await Invoice.countDocuments({ shopId: req.user.shopId });
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${count + 1}`;

        // 3. Create Invoice
        const invoice = await Invoice.create({
            shopId: req.user.shopId,
            invoiceNumber,
            customerDetails,
            items: items.map(item => ({
                ...item,
                price: item.price, // Original selling price
                discountAmount: item.discountAmount || 0,
                appliedDiscountType: item.appliedDiscountType || null,
                finalPrice: item.finalPrice || (item.price - (item.discountAmount || 0))
            })),
            subTotal,
            totalGST,
            discount,
            grandTotal,
            paymentType,
            paymentBreakdown,
            paymentStatus: paymentType === 'EMI' || (paymentBreakdown && paymentBreakdown.emi > 0) ? 'Partial' : 'Paid',
            billedBy: req.user._id
        });

        // 4. Update Stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stockQuantity: -item.quantity }
            });
            // Update StockLog here if implemented
        }

        // 5. Update/Create Customer (Store unique by mobile per shop)
        if (customerDetails.mobile) {
            const existingCustomer = await Customer.findOne({
                shopId: req.user.shopId,
                mobile: customerDetails.mobile
            });

            if (!existingCustomer) {
                await Customer.create({
                    shopId: req.user.shopId,
                    name: customerDetails.name,
                    mobile: customerDetails.mobile,
                    address: customerDetails.address
                });
            }
        }

        // 6. Handle EMI Creation if needed
        let emiData = null;
        if (paymentType === 'EMI' && emiDetails) {
            // Calculate EMI Amounts
            // Simple Flat Rate logic: Total Payable = Principal + (Principal * Rate * Time / 100)
            const P = Number(emiDetails.principalAmount);
            const R = Number(emiDetails.interestRate); // Annual
            const T = emiDetails.tenureType === 'years' ? Number(emiDetails.tenureValue) : Number(emiDetails.tenureValue) / 12;

            const interestAmount = (P * R * T) / 100;
            const totalPayable = P + interestAmount;

            // Monthly EMI
            const totalMonths = emiDetails.tenureType === 'years' ? emiDetails.tenureValue * 12 : emiDetails.tenureValue;
            const emiAmount = Math.ceil(totalPayable / totalMonths);

            // Start/End Dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(startDate.getMonth() + Number(totalMonths));

            // First Due Date (assuming next month)
            const nextDueDate = new Date(startDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);

            emiData = await EMI.create({
                shopId: req.user.shopId,
                invoiceId: invoice._id,
                customerName: customerDetails.name,
                customerMobile: customerDetails.mobile,
                principalAmount: P,
                interestRate: R,
                tenureType: emiDetails.tenureType,
                tenureValue: emiDetails.tenureValue,
                emiAmount: emiAmount,
                totalPayable: totalPayable,
                startDate: startDate,
                endDate: endDate,
                nextDueDate: nextDueDate,
                emiStatus: 'Active'
            });
        }

        res.status(201).json({
            message: 'Invoice created successfully',
            invoice,
            emi: emiData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during billing', error: error.message });
    }
};

// @desc    Get all invoices for a shop
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ shopId: req.user.shopId })
            .sort({ createdAt: -1 })
            .populate('billedBy', 'name'); // Show who billed it
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { createInvoice, getInvoices };
