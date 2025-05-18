const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  action: { type: String, enum: ["add", "delete"], required: true },
  prodid: { type: Number, required: true },
  prodname: { type: String, required: true },
  user: { type: String, required: true }, // employee name or email
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Log", logSchema);