const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    status: {
    type: String,
    enum: ["Active", "Completed"],
    required: true
},

    progress: {
        type: Number,
        default: 0
    },


    icon: {
        type: String,
        default: "🏢"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Project", projectSchema);