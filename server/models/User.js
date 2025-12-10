import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    role: { type: String, required: true, enum: ['admin', 'driver', 'customer'], default: 'driver' },
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: true, unique: true },
    companyID: { type: String, required: true }
})

export const User = mongoose.model("User", userSchema);