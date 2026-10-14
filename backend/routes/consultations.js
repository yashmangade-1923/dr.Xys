const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Consultation = require('../models/Consultation');

// @route   POST /api/consultations
// @desc    Save a new consultation
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { patientContext, diagnosis, transcript, vitals, bodyMap } = req.body;
    
    const newConsultation = new Consultation({
      userId: req.user.id,
      patientContext,
      diagnosis,
      transcript,
      vitals,
      bodyMap
    });

    const consultation = await newConsultation.save();
    res.json(consultation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/consultations
// @desc    Get all user's consultations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const consultations = await Consultation.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(consultations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
