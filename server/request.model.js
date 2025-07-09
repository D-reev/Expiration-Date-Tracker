// models/passwordResetRequest.model.js
const mongoose = require('mongoose');
const request = new mongoose.Schema({
  email: String,
  role: String,
  status: { type: String, default: "pending" }, // pending, approved, rejected
  requestedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('request', request);