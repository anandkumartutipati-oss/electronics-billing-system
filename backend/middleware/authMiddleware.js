const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            // Concurrent Login Check
            const isSuperAdmin = req.user.role === 'superadmin';
            // Default to '1' if not specified, implies strict mode if variables are missing?
            // User requested explicit variables. If variable is present and '1', we enforce.
            // Or we check if variables are set. Let's assume strict logic based on request.

            const adminLimit = process.env.ADMIN_MAX_CONCURRENT_LOGINS;
            const customerLimit = process.env.CUSTOMER_MAX_CONCURRENT_LOGINS;

            const shouldRestrict = (isSuperAdmin && adminLimit === '1') || (!isSuperAdmin && customerLimit === '1');

            if (shouldRestrict) {
                if (req.user.currentSessionId && decoded.sessionId !== req.user.currentSessionId) {
                    return res.status(401).json({ message: 'Session expired. You have logged in from another device.' });
                }
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
