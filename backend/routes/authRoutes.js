import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.post('/login',async (req, res) => {
    try{
    const { email, password } = req.body;
   console.log(req.body);
   const user=await User.findOne({email});
    console.log(user);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;