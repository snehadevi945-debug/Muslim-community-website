const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Notice = require("./AdminPanel/models/Notice");
const Project = require("./AdminPanel/models/projects");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

//Edit projects
app.put("/api/projects/:id", async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});