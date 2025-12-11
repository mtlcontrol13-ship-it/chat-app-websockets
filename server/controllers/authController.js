import { User } from "../models/User.js";

export const loginUser = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Please enter your email address" });
        }

        const existingUser = await User.findOne({
            email: email
        }).populate('assignedTo', '_id userName email role')

        if (!existingUser) {
            return res.status(404).json({ message: "This email is not registered. Please check and try again." });
        }

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: existingUser._id,
                email: existingUser.email,
                userName: existingUser.userName,
                role: existingUser.role,
                companyId: existingUser.companyId,
                assignedTo: existingUser.assignedTo
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
            return res.status(400).json({ message: "Please enter both username and email" });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "This email is already registered. Please use a different email." });
        }

        const newUser = new User({ username, email });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
}
