const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const validateRequest = require('../middleware/validateRequest');

router.post(
  '/form-submission',
  validateRequest.validateFormData,
  formController.handleFormSubmission
);

module.exports = router;
