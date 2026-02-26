module.exports = (req, res, next) => {
  const { email, firstName } = req.body;
  
  if (!email || !firstName) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and firstName are required' 
    });
  }
  
  next();
};
