const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Security: Always create as 'client' - ignore any role parameter
    // Admins must be created through the secure /register-admin endpoint
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hash, role: 'client' }); // Always 'client'
    await user.save();
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        _id: user._id,
        id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role,
        createdAt: user.createdAt
      } 
    });
  } catch (err) {
    next(err);
  }
};

// Secure admin registration endpoint - requires ADMIN_SECRET_KEY
exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, adminSecret } = req.body;
    
    // Verify admin secret key from environment variable
    const requiredSecret = process.env.ADMIN_SECRET_KEY;
    if (!requiredSecret) {
      return res.status(500).json({ error: 'Admin registration is not configured. Contact system administrator.' });
    }
    
    if (!adminSecret || adminSecret !== requiredSecret) {
      return res.status(403).json({ error: 'Invalid admin secret key' });
    }
    
    // Check if admin with this email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hash, role: 'admin' });
    await user.save();
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        _id: user._id,
        id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role,
        createdAt: user.createdAt
      },
      message: 'Admin account created successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        _id: user._id,
        id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role,
        createdAt: user.createdAt
      } 
    });
  } catch (err) {
    next(err);
  }
};
