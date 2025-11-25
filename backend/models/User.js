import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
      phone: { type: String, default: "" },
    role: {
        type: String,
        enum: ["Admin", "Student", "Professor", "HOD"],
        default: "Admin"
    },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null }

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;