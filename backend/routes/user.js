const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      name, address, contactNumber, bloodGroup, emergencyContacts,
      jobTitle, fatherName, motherName, healthBio, medicalHistory, profilePicture,
      height, weight
    } = req.body;
    
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (address) user.address = address;
    if (contactNumber) user.contactNumber = contactNumber;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (emergencyContacts) user.emergencyContacts = emergencyContacts;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (fatherName !== undefined) user.fatherName = fatherName;
    if (motherName !== undefined) user.motherName = motherName;
    if (healthBio !== undefined) user.healthBio = healthBio;
    if (medicalHistory !== undefined) user.medicalHistory = medicalHistory;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
