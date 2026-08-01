const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        trim: true,
        default: ""
    },

    photo: {
        type: String,
        default: ""
    },

    about: {
        type: String,
        trim: true,
        default: ""
    },

    responsibilities: {
        type: [String],
        default: []
    },

    role: {
        type: String,
        enum: ["ADMIN", "SUPER ADMIN"],
        default: "ADMIN"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Admin", adminSchema);
