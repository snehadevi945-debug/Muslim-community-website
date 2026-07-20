const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Notice = require("./AdminPanel/models/Notice");
const Project = require("./AdminPanel/models/projects");
const Member = require("./AdminPanel/models/members");
const Gallery = require("./AdminPanel/models/gallery");

console.log(Gallery);
const Donation = require("./AdminPanel/models/donation");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/muslim-community-website")
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

// Home Route
app.get("/", (req, res) => {
    res.send("MongoDB Connected Successfully.");
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

//Projects
app.get("/api/projects", async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post("/api/projects", async (req, res) => {
    console.log("Request Body:", req.body);

    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Get all members
app.get("/api/members", async (req, res) => {
    try {
        const members = await Member.find();
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a member
app.post("/api/members", async (req, res) => {
    try {
        const member = new Member(req.body);
        await member.save();
        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a member
app.put("/api/members/:id", async (req, res) => {
    try {
        const updatedMember = await Member.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedMember);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a member
app.delete("/api/members/:id", async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.params.id);
        res.json({ message: "Member deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all albums
app.get("/api/gallery", async (req, res) => {
    try {
        const gallery = await Gallery.find();
        res.json(gallery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create album
app.post("/api/gallery", async (req, res) => {

    console.log("POST /api/gallery hit");

    try {

        console.log(req.body);

        const album = new Gallery(req.body);

        await album.save();

        res.status(201).json(album);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }
});

// Update album
app.put("/api/gallery/:id", async (req, res) => {
    try {
        const updatedAlbum = await Gallery.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedAlbum);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete album
app.delete("/api/gallery/:id", async (req, res) => {
    try {
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: "Album deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get donation details
app.get("/api/donations", async (req, res) => {
    try {
        const donation = await Donation.findOne();
        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create donation details (run once)
app.post("/api/donations", async (req, res) => {
    try {
        const donation = new Donation(req.body);
        await donation.save();
        res.status(201).json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update donation details
app.put("/api/donations/:id", async (req, res) => {
    try {
        const updatedDonation = await Donation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedDonation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete donation details
app.delete("/api/donations/:id", async (req, res) => {
    try {
        await Donation.findByIdAndDelete(req.params.id);
        res.json({ message: "Donation details deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});