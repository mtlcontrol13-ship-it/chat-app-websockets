import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema({
    role: { type: String, required: true, enum: ['admin', 'driver', 'customer'], default: 'driver' },
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: true, unique: true },
    companyId: {
        type: String,
        required: true,
        default: function () {
            return this.role === 'admin' ? uuidv4() : undefined;
        }
    },
})

export const User = mongoose.model("User", userSchema);