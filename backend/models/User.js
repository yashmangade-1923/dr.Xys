const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required']
  },
  bloodGroup: {
    type: String,
    default: ''
  },
  emergencyContacts: {
    type: [{
      name: String,
      relation: String,
      contactNumber: String,
      bloodGroup: String
    }],
    default: []
  },
  jobTitle: {
    type: String,
    default: ''
  },
  fatherName: {
    type: String,
    default: ''
  },
  motherName: {
    type: String,
    default: ''
  },
  healthBio: {
    type: String,
    default: ''
  },
  medicalHistory: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: ''
  },
  weight: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
