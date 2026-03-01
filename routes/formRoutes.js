const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

router.post('/form-submission', validateFormData, formController.handleFormSubmission);

module.exports = router;
