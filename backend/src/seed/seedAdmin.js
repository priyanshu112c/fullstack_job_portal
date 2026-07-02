import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");

        const existingAdmin = await User.findOne({
            email: "admindaddy@gmail.com",
        });

        if (existingAdmin) {
            console.log("⚠️ Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("Daddy@123", 10);

        const admin = await User.create({
            name: "Super Admin",
            email: "admindaddy@gmail.com",
            password: hashedPassword,
            role: "admin",
        });

        console.log("✅ Admin created successfully");
        console.log({
            email: admin.email,
            password: "Adminsabkabaap@123",
            role: admin.role,
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed Error:", error.message);
        process.exit(1);
    }
};

seedAdmin();