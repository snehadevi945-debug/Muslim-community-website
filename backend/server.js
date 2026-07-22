const dns = require("dns");

if (process.env.NODE_ENV !== "production") {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
}
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notice = require("./models/Notice");
const Project = require("./models/projects");
const Member = require("./models/members");
const Gallery = require("./models/gallery");
const Admin = require("./models/Admin");
const Donation = require("./models/donation");

const JWT_SECRET = process.env.JWT_SECRET || "muslim_community_super_secret_key_2026";

const app = express();
app.use(cors({
    origin: "https://muslim-community-website.vercel.app/",
    credentials: true
}));
app.use(express.json());
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to Atlas"))
.catch(err => console.log(err));

// Home Route
app.get("/", (req, res) => {
    res.send("MongoDB Connected Successfully.");
});

// --- Auth Routes ---
app.post("/api/admin/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin with this email already exists" });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newAdmin = new Admin({
            name,
            email,
            password: hashedPassword
        });
        
        await newAdmin.save();
        res.status(201).json({ message: "Admin created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        
        // Create token
        const token = jwt.sign(
            { id: admin._id, role: admin.role, name: admin.name },
            JWT_SECRET,
            { expiresIn: "1d" }
        );
        
        res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/admin/verify", async (req, res) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select("-password");
        
        if (!admin) {
            return res.status(401).json({ message: "Token is not valid" });
        }
        
        res.json(admin);
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
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

// Get all notices
app.get("/api/notices", async (req, res) => {
    try {
        const notices = await Notice.find();
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
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
      console.log("PUT Request");
    console.log("ID:", req.params.id);
    console.log("Body:", req.body);

    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }});
// Delete Projects
app.delete("/api/projects/:id", async (req, res) => {
     console.log("DELETE Request");
    console.log("ID:", req.params.id);

    try {
        await Project.findByIdAndDelete(req.params.id);

        res.json({
            message: "Project deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
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

//get admin
app.get("/api/admin", async (req, res) => {
    try {
        const admins = await Admin.find().select("-password");
        res.json(admins);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//update admin
app.put("/api/admin/:id", async (req, res) => {
    try {

        const updateData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        };

        if (req.body.password) {

            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.body.password, salt);

        }

        const admin = await Admin.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select("-password");

        res.json(admin);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//delete admin
app.delete("/api/admin/:id", async (req, res) => {

    try {

        await Admin.findByIdAndDelete(req.params.id);

        res.json({
            message: "Admin deleted"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});

app.post("/api/admin", async (req, res) => {

    try {

        const { name, email, password, role } = req.body;

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({
                message: "Admin with this email already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = new Admin({
            name,
            email,
            password: hashedPassword,
            role
        });

        await admin.save();

        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});