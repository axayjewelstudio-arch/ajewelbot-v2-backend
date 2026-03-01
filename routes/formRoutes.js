const express = require('express');
const router = express.Router();
const { handleFormSubmission } = require('../controllers/formController');

router.post('/form-submission', async (req, res) => {
  try {
    console.log('📥 Received form data:', JSON.stringify(req.body, null, 2));
    
    const result = await handleFormSubmission(req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
