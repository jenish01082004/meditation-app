const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    public_id: { type: String, required: true }  // 👈 ADD THIS
}, { timestamps: true });


module.exports = mongoose.model('Category', categorySchema);
