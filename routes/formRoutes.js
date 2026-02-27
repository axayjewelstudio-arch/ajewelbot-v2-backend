const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { validateFormData } = require('../middleware/validateRequest');

router.post('/form-submission', validateFormData, formController.handleFormSubmission);

module.exports = router;
