const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userid: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Add this line
    role: { type: String, default: "employee" },
    created_at: { type: String, default: () => new Date().toISOString().slice(0, 10) }
});

module.exports = mongoose.model("User", userSchema);