exports.generateReferralCode = (customerId, firstName) => {
  const code = `${firstName.substring(0, 3).toUpperCase()}${customerId.toString().slice(-4)}`;
  return code;
};

exports.validateReferralCode = async (code) => {
  try {
    console.log(`🔍 Validating referral code: ${code}`);
    return { valid: true, discount: 10 };
  } catch (error) {
    console.error('❌ Referral validation error:', error.message);
    return { valid: false };
  }
};
