const EMI = require('../models/EMI');
const EmiPayment = require('../models/EmiPayment');

// @desc    Get all EMIs for a shop
// @route   GET /api/emi
// @access  Private (Owner/Staff)
const getEMIs = async (req, res) => {
    try {
        if (!req.user.shopId) {
            return res.status(400).json({ message: 'User not assigned to a shop' });
        }

        const emis = await EMI.find({ shopId: req.user.shopId })
            .sort({ createdAt: -1 });
        res.json(emis);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single EMI details with payment history
// @route   GET /api/emi/:id
// @access  Private
const getEmiDetails = async (req, res) => {
    try {
        const emi = await EMI.findById(req.params.id);
        if (!emi) return res.status(404).json({ message: 'EMI not found' });

        if (emi.shopId.toString() !== req.user.shopId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const payments = await EmiPayment.find({ emiId: req.params.id }).sort({ date: -1 });

        res.json({ emi, payments });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Pay EMI Installment
// @route   POST /api/emi/:id/pay
// @access  Private
const payEMI = async (req, res) => {
    try {
        const { amount, remarks } = req.body;
        const emi = await EMI.findById(req.params.id);

        if (!emi) return res.status(404).json({ message: 'EMI record not found' });

        // Record Payment
        const payment = await EmiPayment.create({
            emiId: emi._id,
            shopId: req.user.shopId,
            amount: Number(amount),
            date: new Date(),
            mode: 'Cash', // Defaulting for now
            remarks
        });

        // Update EMI status (Simple check)
        // Ideally we check total paid vs total payable
        // For MVP: We just log payment. Next Due Date could be pushed.

        const nextDate = new Date(emi.nextDueDate);
        nextDate.setMonth(nextDate.getMonth() + 1); // Push due date by 1 month
        emi.nextDueDate = nextDate;

        // Mark completed if balance is low (Manual check usually preferred or complex logic)
        // emi.emiStatus = 'Active'; 

        await emi.save();

        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Payment Error', error: error.message });
    }
};

module.exports = { getEMIs, getEmiDetails, payEMI };
