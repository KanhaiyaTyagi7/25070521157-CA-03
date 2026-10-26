
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Student = require("./models/Student");
const Attendance = require("./models/Attendance");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Attendance Record Manager API is running!");
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Register admin account
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: (email || "").toLowerCase().trim(),
    });

    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({
        message: "Incorrect email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// All routes below this line require login
app.use("/api", authenticateToken);

// Admin-only middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// Get all students (admin only)
app.get("/api/students", requireAdmin, async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add student (admin only)
app.post("/api/students", requireAdmin, async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student (admin only)
app.delete("/api/students/:id", requireAdmin, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Attendance.deleteMany({ student: student._id });
    res.json({ message: "Student and attendance records deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get attendance by date (admin only)
app.get("/api/attendance", requireAdmin, async (req, res) => {
  try {
    const filter = req.query.date ? { date: req.query.date } : {};
    const records = await Attendance.find(filter)
      .populate("student", "name rollNumber")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update attendance (admin only)
app.post("/api/attendance", requireAdmin, async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    if (!studentId || !date || !["Present", "Absent", "Late"].includes(status)) {
      return res.status(400).json({
        message: "Valid studentId, date and status are required",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const record = await Attendance.findOneAndUpdate(
      { student: studentId, date },
      { $set: { status } },
      { new: true, upsert: true, runValidators: true }
    ).populate("student", "name rollNumber");

    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Dashboard stats (admin only)
app.get("/api/dashboard", requireAdmin, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const [totalStudents, records] = await Promise.all([
      Student.countDocuments(),
      Attendance.find({ date }),
    ]);

    const present = records.filter((r) => r.status === "Present").length;
    const absent = records.filter((r) => r.status === "Absent").length;
    const late = records.filter((r) => r.status === "Late").length;

    res.json({
      totalStudents,
      present,
      absent,
      late,
      totalMarked: records.length,
      attendancePercentage: records.length
        ? Number(((present / records.length) * 100).toFixed(1))
        : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student profile and reports are added after student accounts are linked
// to Student records. Do not allow arbitrary student IDs to fetch private data.

async function startServer() {
  try {
    if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
      throw new Error("MONGODB_URI and JWT_SECRET must be set in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
