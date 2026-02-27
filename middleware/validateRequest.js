exports.validateFormData = (req, res, next) => {
  const { firstName, lastName, email, mobile, customerType, consentTerms } = req.body;

  if (!firstName || !lastName || !email || !mobile) {
    return res.status(400).json({
      success: false,
      message: 'First Name, Last Name, Email, and Mobile are required'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  const mobileRegex = /^[6-9]\d{9}$/;
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  if (!mobileRegex.test(cleanMobile)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid mobile number'
    });
  }

  if (consentTerms !== 'yes' && consentTerms !== true) {
    return res.status(400).json({
      success: false,
      message: 'You must accept the terms and conditions'
    });
  }

  if (!customerType || !['Retail', 'B2B'].includes(customerType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid customer type'
    });
  }

  next();
};
