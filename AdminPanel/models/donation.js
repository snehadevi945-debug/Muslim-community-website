const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
{
    upiId: {
        type: String,
        required: true
    },

    mobileNumber: {
        type: String,
        required: true
    },

    accountName: {
        type: String,
        required: true
    },

    accountNumber: {
        type: String,
        required: true
    },

    ifsc: {
        type: String,
        required: true
    },

    qrImage: {
        type: String,
        default: ""
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Donation", donationSchema);