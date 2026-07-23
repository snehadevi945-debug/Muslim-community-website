const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    title: String,
    description: String,
    attachment: String,
    type: String,
    publishedDate: String
});

module.exports = mongoose.model("Notice", noticeSchema);