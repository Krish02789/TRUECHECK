import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  aadhaar: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'Aadhaar must be 12 digits'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'candidate', 'user'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationData: {
    aadhaarVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ aadhaar: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

export default User;
