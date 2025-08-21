import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  txnId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['aadhaar', 'email'],
    required: true
  },
  target: {
    type: String,
    required: true // aadhaar number or email
  },
  otp: {
    type: String,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    provider: String // 'mock' or 'real'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
verificationSchema.index({ txnId: 1 });
verificationSchema.index({ target: 1 });
verificationSchema.index({ expiresAt: 1 });
verificationSchema.index({ userId: 1 });

// Method to check if OTP is expired
verificationSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

// Method to check if max attempts reached
verificationSchema.methods.hasMaxAttempts = function() {
  return this.attempts >= this.maxAttempts;
};

// Method to increment attempts
verificationSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;
