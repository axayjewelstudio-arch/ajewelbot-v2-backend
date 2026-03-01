const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

router.post('/form-submission', formController.handleFormSubmission);

module.exports = router;
