const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Rating = require('../models/Rating');

// @route   POST /api/ratings
// @desc    Submit a user rating
// @access  Public (Optional Auth)
router.post('/', async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }

    let userId = null;
    
    // Check if token is provided to link the rating to a user
    const token = req.header('Authorization');
    if (token) {
      try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        userId = decoded.user.id;
      } catch (err) {
        // Token is invalid or expired, but we still want to save the anonymous rating
        console.warn('Invalid token provided for rating, saving as anonymous');
      }
    }

    const newRating = new Rating({
      userId,
      rating
    });

    const savedRating = await newRating.save();
    res.status(201).json(savedRating);
    
  } catch (err) {
    console.error("Error saving rating:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
