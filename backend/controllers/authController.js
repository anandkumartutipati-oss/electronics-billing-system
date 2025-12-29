const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, sessionId) => {
    return jwt.sign({ id, sessionId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Generate Session ID (timestamp + random)
        const sessionId = new Date().getTime().toString() + Math.random().toString(36).substring(7);
        user.currentSessionId = sessionId;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shopId: user.shopId,
            token: generateToken(user._id, sessionId),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a user (Super Admin or initial setup)
// @route   POST /api/auth/register
// @access  Public (should be protected in production)
const registerUser = async (req, res) => {
    const { name, email, mobile, password, role, shopId } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const sessionId = new Date().getTime().toString() + Math.random().toString(36).substring(7);

    const user = await User.create({
        name,
        email,
        mobile,
        password,
        role,
        shopId,
        currentSessionId: sessionId
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, sessionId),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.mobile = req.body.mobile || user.mobile;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            role: updatedUser.role,
            shopId: updatedUser.shopId,
            token: generateToken(updatedUser._id, updatedUser.currentSessionId),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { loginUser, registerUser, updateUserProfile };
