const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    prodid: { type: Number, required: true, unique: true },
    prodname: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String },
    expiry_date: { type: String, required: true },
    added_date: { type: String, required: true },
    notification_sent: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    price: { type: Number, default: null },
});

module.exports = mongoose.model("Product", productSchema);
