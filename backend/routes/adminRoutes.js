import express from "express";
import User from "../models/User.js";
import Department from "../models/Department.js";
import { verifyToken, adminOnly } from "../middleware/auth.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs"; 

const router = express.Router();

router.get("/dashboard", verifyToken, adminOnly, async (req, res) => {
  try {
    const totalDepartments = await Department.countDocuments();

    const totalStudents = await User.countDocuments({ role: "Student" });
    const totalProfessors = await User.countDocuments({ role: "Professor" });
    const totalHods = await User.countDocuments({ role: "HOD" });

    res.json({
      totalDepartments,
      totalStudents,
      totalProfessors,
      totalHods,
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/departments/create", verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, type, address } = req.body;
    console.log(req.body);

    if (!name || !type || !address){
      console.log("Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Department.findOne({ name });
    console.log(exists);
    if (exists) return res.status(400).json({ message: "Department already exists" });

    const newDept = new Department({ name, type, address });
    console.log(newDept);
    await newDept.save();

    res.json({ message: "Department created successfully", department: newDept });
  } catch (err) {
    console.error("Create department error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/departments/all", verifyToken, adminOnly, async (req, res) => {
  try {
    const depts = await Department.find().sort({ name: 1 }).select("_id name type");
    res.json({ departments: depts });
  } catch (err) {
    console.error("Get all departments error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------------------------------------------
   USER STORY 4 
------------------------------------------------------------------ */
router.get("/departments", verifyToken, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const type = req.query.type || "All";

    // Build filter
    let filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (type !== "All") {
      filter.type = type;
    }

    // Fetch departments
    const departments = await Department.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalDepartments = await Department.countDocuments(filter);

    // Count users for each department
    const departmentWithUserCount = await Promise.all(
      departments.map(async (d) => {
        const userCount = await User.countDocuments({ departmentId: d._id });
        return {
          _id: d._id,
          name: d.name,
          type: d.type,
          userCount,
        };
      })
    );

    res.json({
      total: totalDepartments,
      page,
      pages: Math.ceil(totalDepartments / limit),
      departments: departmentWithUserCount,
    });
  } catch (err) {
    console.error("Department List Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});
 // user story 5
router.get("/departments/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(department);
  } catch (err) {
    console.error("Fetch single dept error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------------------------------------------
   UPDATE DEPARTMENT
------------------------------------------------------------------ */
router.put("/departments/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, type, address } = req.body;

    if (!name || !type || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      { name, type, address },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ message: "Department updated successfully", department: updated });
  } catch (err) {
    console.error("Update dept error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


/* ------------------------------------------------------------------
   DELETE DEPARTMENT
------------------------------------------------------------------ */
router.delete("/departments/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const deptId = req.params.id;

    const department = await Department.findById(deptId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const userCount = await User.countDocuments({ departmentId: deptId });

    if (userCount > 0) {
      return res.status(400).json({
        message: "Cannot delete department. Users are associated with this department.",
      });
    }

    await Department.findByIdAndDelete(deptId);

    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error("Delete dept error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});



/* CREATE USER (Admin) */

router.post("/users/create", verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, email, password, phone, role, departmentId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

   if (departmentId) {
      const dept = await Department.findById(departmentId);
      if (!dept) {
        return res.status(400).json({ message: "Invalid department selected" });
      }
    }
     const plainPassword = password && password.length >= 6 ? password : generateRandomPassword();

    // Hash password
    const hashed = await bcrypt.hash(plainPassword, 10);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashed,
      phone: phone || "",
      role,
      departmentId: departmentId || null,
    });
        await newUser.save();
if (process.env.SEND_WELCOME_EMAIL === "true") {
      try {
        await sendWelcomeEmail(newUser.email, newUser.name, plainPassword);
      } catch (mailErr) {
        console.warn("Welcome email failed:", mailErr.message);
       
      }
    }

    return res.json({
      message: "User created successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    console.error("Create user error:", err);
    // Handle duplicate key error from mongodb
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: "Server error" });
  }
});


function generateRandomPassword() {
    return Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 90 + 10);

}

async function sendWelcomeEmail(toEmail, userName, password) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
   const mailOptions = {
    from: process.env.EMAIL_FROM || "no-reply@university.com",
    to: toEmail,
    subject: "Welcome — your account credentials",
    text: `Hi ${userName},

Your account has been created.

Email: ${toEmail}
Password: ${password}

Please login and change your password.

Regards,
Admin`,
  };

  await transporter.sendMail(mailOptions);

}

export default router;
