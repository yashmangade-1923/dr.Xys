const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientContext: {
    type: Object,
    default: {}
  },
  diagnosis: {
    possible_conditions: [String],
    biological_explanation: [Object],
    mock_prescription: [Object],
    further_actions: String,
    doctor_warning: String,
    interview_summary: String,
    type: { type: String, default: "medical" }
  },
  transcript: [{
    role: String,
    text: String,
    timestamp: Date
  }],
  vitals: {
    type: Object,
    default: null
  },
  bodyMap: {
    type: Object,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
