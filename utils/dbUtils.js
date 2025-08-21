import User from '../models/User.js';
import Verification from '../models/Verification.js';

// User utilities
export const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return { ok: true, user };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return { ok: true, user };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const findUserByAadhaar = async (aadhaar) => {
  try {
    const user = await User.findOne({ aadhaar });
    return { ok: true, user };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const updateUserVerification = async (userId, verificationData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          isVerified: true,
          verificationData: verificationData,
          'verificationData.verifiedAt': new Date()
        }
      },
      { new: true }
    );
    return { ok: true, user };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

// Verification utilities
export const createVerification = async (verificationData) => {
  try {
    const verification = new Verification(verificationData);
    await verification.save();
    return { ok: true, verification };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const findVerificationByTxnId = async (txnId) => {
  try {
    const verification = await Verification.findOne({ txnId });
    return { ok: true, verification };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const markVerificationAsUsed = async (txnId) => {
  try {
    const verification = await Verification.findOneAndUpdate(
      { txnId },
      { $set: { isUsed: true, isVerified: true } },
      { new: true }
    );
    return { ok: true, verification };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

// Cleanup expired verifications
export const cleanupExpiredVerifications = async () => {
  try {
    const result = await Verification.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return { ok: true, deletedCount: result.deletedCount };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

// Database health check
export const checkDatabaseHealth = async () => {
  try {
    const userCount = await User.countDocuments();
    const verificationCount = await Verification.countDocuments();
    return { 
      ok: true, 
      stats: { 
        users: userCount, 
        verifications: verificationCount 
      } 
    };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};
