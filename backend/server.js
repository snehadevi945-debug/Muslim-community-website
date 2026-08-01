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
const Settings = require("./models/Settings");

const JWT_SECRET = process.env.JWT_SECRET || "muslim_community_super_secret_key_2026";
console.log(JWT_SECRET);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
const PORT = 3000;

function normalizeMemberPayload(body = {}) {
    const payload = { ...body };

    if (!payload.fullName && payload.name) {
        payload.fullName = payload.name;
    }

    if (!payload.dateOfJoining && payload.joining) {
        payload.dateOfJoining = payload.joining;
    }

    if (!payload.name && payload.fullName) {
        payload.name = payload.fullName;
    }

    if (!payload.joining && payload.dateOfJoining) {
        payload.joining = payload.dateOfJoining;
    }

    if (payload.memberType) {
        payload.memberType = payload.memberType.toUpperCase();
    } else if (payload.type) {
        payload.memberType = payload.type.toUpperCase();
    } else {
        const roleStr = (payload.role || '').toLowerCase();
        if (roleStr.includes('general') || roleStr === 'member') {
            payload.memberType = 'GENERAL';
        } else {
            payload.memberType = 'EXECUTIVE';
        }
    }

    if (payload.responsibilities && typeof payload.responsibilities === 'string') {
        payload.responsibilities = payload.responsibilities
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
    }
    if (!Array.isArray(payload.responsibilities)) {
        payload.responsibilities = payload.responsibilities ? [payload.responsibilities] : [];
    }

    if (!payload.about && payload.bio) {
        payload.about = payload.bio;
    }

    return payload;
}

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
        const { name, email, password, phone, photo, about, responsibilities } = req.body;
        
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
            password: hashedPassword,
            phone: phone || "",
            photo: photo || "",
            about: about || "",
            responsibilities: Array.isArray(responsibilities)
                ? responsibilities
                : responsibilities
                    ? responsibilities.split(',').map(item => item.trim()).filter(Boolean)
                    : []
        });
        
        await newAdmin.save();
        res.status(201).json({
            message: "Admin created successfully",
            admin: {
                name: newAdmin.name,
                email: newAdmin.email,
                phone: newAdmin.phone || "",
                photo: newAdmin.photo || "",
                about: newAdmin.about || "",
                responsibilities: newAdmin.responsibilities || []
            }
        });
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
        
        res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, phone: admin.phone || "", photo: admin.photo || "", role: admin.role } });
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
        const payload = { ...req.body };
        if (payload.progress !== undefined) {
            payload.progress = Math.min(100, Math.max(0, Number(payload.progress) || 0));
        }
        const project = new Project(payload);
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
        const payload = { ...req.body };
        if (payload.progress !== undefined) {
            payload.progress = Math.min(100, Math.max(0, Number(payload.progress) || 0));
        }
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true }
        );

        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
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

        const memberData = normalizeMemberPayload(req.body);
        console.log(memberData);

        const member = new Member(memberData);

        await member.save();

        res.status(201).json(member);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message,
            stack: error.stack
        });

    }
});

// Update a member
app.put("/api/members/:id", async (req, res) => {
    try {
        const updatedMember = await Member.findByIdAndUpdate(
            req.params.id,
            normalizeMemberPayload(req.body),
            { new: true, runValidators: true }
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
            phone: req.body.phone || "",
            photo: req.body.photo || "",
            role: req.body.role,
            about: req.body.about || "",
            responsibilities: Array.isArray(req.body.responsibilities)
                ? req.body.responsibilities
                : req.body.responsibilities
                    ? req.body.responsibilities.split(',').map(item => item.trim()).filter(Boolean)
                    : []
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
        const { name, email, password, phone, photo, role, about, responsibilities } = req.body;

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
            phone: phone || "",
            photo: photo || "",
            role,
            about: about || "",
            responsibilities: Array.isArray(responsibilities)
                ? responsibilities
                : responsibilities
                    ? responsibilities.split(',').map(item => item.trim()).filter(Boolean)
                    : []
        });

        await admin.save();

        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            role: admin.role
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// --- Settings Routes (Donation Details) ---
app.get("/api/settings/donation", async (req, res) => {
    try {
        let donationSetting = await Settings.findOne({ key: "donation_details" });
        if (!donationSetting) {
            donationSetting = {
                key: "donation_details",
                value: {
                    accountName: "Muslim Community Welfare Trust",
                    accountNumber: "987654321012",
                    ifscCode: "SBIN0001234",
                    qrCodeUrl: "assets/hero_bg.png"
                }
            };
        }
        res.json(donationSetting.value);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put("/api/settings/donation", async (req, res) => {
    try {
        const { accountName, accountNumber, ifscCode, qrCodeUrl } = req.body;
        const updatedSetting = await Settings.findOneAndUpdate(
            { key: "donation_details" },
            { key: "donation_details", value: { accountName, accountNumber, ifscCode, qrCodeUrl } },
            { new: true, upsert: true }
        );
        res.json(updatedSetting.value);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
