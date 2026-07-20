console.log("Gallery model loaded");
const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true
    },

   coverImage: {
       type: String,
       default: ""
   },

    photos: [
        {
            type: String
        }
    ],
},
{
    timestamps: true,
    collection: "gallery"
});

module.exports = mongoose.model("Gallery", gallerySchema);
