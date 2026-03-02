exports.validateFormData = (req, res, next) => {
  const { firstName, lastName, email, mobile, consentTerms } = req.body;
  
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
  
  if (consentTerms !== 'yes' && consentTerms !== true) {
    return res.status(400).json({
      success: false,
      message: 'You must accept the terms and conditions'
    });
  }
  
  next();
};
