const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Notice = require("./models/Notice");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/muslim_community")
.then(() => {
    console.log("✅ MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

// Home Route
app.get("/", (req, res) => {
    res.send("Hello Sneha! MongoDB Connected Successfully.");
});
// Get all notices
app.get("/api/notices", async (req, res) => {
    try {
        const notices = await Notice.find();
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Create a notice
app.post("/api/notices", async (req, res) => {
    try {
        const notice = new Notice(req.body);
        await notice.save();
        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Update a notice
app.put("/api/notices/:id", async (req, res) => {
    try {
        const updatedNotice = await Notice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedNotice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Delete a notice
app.delete("/api/notices/:id", async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: "Notice deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});