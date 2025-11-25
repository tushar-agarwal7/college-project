import mongoose  from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../configs/db.js";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();
        
        const adminEmail = "tushar@gmail.com"
        const password="tushar123"
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const existing=await User.findOne({ email: adminEmail });
        if(existing){
            console.log("Admin user already exists");
            process.exit(0);
        }
        
        const adminUser = new User({
            email: adminEmail,
            password: hashedPassword,
            role: "Admin"
        });

        await adminUser.save();
        console.log("Admin user created successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1);
    }
};

createAdmin();