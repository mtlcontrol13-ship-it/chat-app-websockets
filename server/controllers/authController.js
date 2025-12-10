import { User } from "../models/User.js";

export const loginUser = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existingUser = await User.findOne({
            email: email
        })

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "User logged in successfully",
            user: {
                id: existingUser._id,
                email: existingUser.email,
                userName: existingUser.userName,
                role: existingUser.role,
                companyId: existingUser.companyId
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in user", error: error.message });
    }
}

export const registerUser = async (req, res) => {
    const { username, email } = req.body;
    try {
        if (!username || !email) {
            return res.status(400).json({ message: "Username and email are required" });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const newUser = new User({ username, email });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
}

export const getCompanyUsers = async (req, res) => {
    try {
        const { companyId } = req.params;

        if (!companyId) {
            return res.status(400).json({ message: "Company ID is required" });
        }

        // Find all users (admin, drivers, customers) with this companyId
        // Admins have their own companyId, others are linked to admin's companyId
        const users = await User.find({ companyId }).select('_id userName email role companyId');

        res.status(200).json({ 
            message: "Company users retrieved successfully",
            users
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching company users", error: error.message });
    }
}
