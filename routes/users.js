import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).select('-__v');
    res.json({ ok: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    res.json({ ok: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, aadhaar, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { aadhaar }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        ok: false, 
        error: 'User with this email or Aadhaar already exists' 
      });
    }

    const user = new User({
      name,
      email,
      phone,
      aadhaar,
      role: role || 'user'
    });

    await user.save();
    res.status(201).json({ ok: true, user });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ ok: false, error: error.message });
    }
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, aadhaar, role, isVerified, verificationData } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (aadhaar) user.aadhaar = aadhaar;
    if (role) user.role = role;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (verificationData) user.verificationData = { ...user.verificationData, ...verificationData };

    await user.save();
    res.json({ ok: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ ok: false, error: error.message });
    }
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    res.json({ ok: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Get users by role
router.get('/role/:role', async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).select('-__v');
    res.json({ ok: true, users });
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

export default router;
