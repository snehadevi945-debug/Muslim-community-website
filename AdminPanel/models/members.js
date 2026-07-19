const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    joining: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("Member", memberSchema);