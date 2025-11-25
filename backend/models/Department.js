import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String,   enum: ["UG", "PG", "Research", "Engineering", "Science"],
     required: true },
  address: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Department", departmentSchema);
