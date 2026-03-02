const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/available-dates', appointmentController.getAvailableDates);
router.get('/available-slots', appointmentController.getAvailableTimeSlots);
router.post('/book', appointmentController.bookAppointment);
router.post('/confirm', appointmentController.confirmAppointment);
router.post('/reschedule', appointmentController.rescheduleAppointment);

module.exports = router;
