import { User } from "../models/User";

export const addUserToChat = async (req, res) => {
    try {
        const { email, currentUserEmail, companyId } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Check if user is trying to add themselves
        if (email === currentUserEmail) {
            return res.status(400).json({ message: "You cannot add yourself to a chat" });
        }

        if (!companyId) {
            return res.status(400).json({ message: "Company ID is required" });
        }

        // First check if user exists by email
        const userByEmail = await User.findOne({ email });
        if (!userByEmail) {
            return res.status(404).json({ message: "User doesn't exist. Please ask them to register first." });
        }

        // Then check if user belongs to the specified company
        if (userByEmail.companyId !== companyId) {
            return res.status(400).json({ message: "User exists but doesn't belong to this company. Please verify the Company ID." });
        }

        // Return user details
        res.status(200).json({
            message: `User ${userByEmail.userName} added to chat successfully`,
            user: {
                id: userByEmail._id,
                email: userByEmail.email,
                userName: userByEmail.userName,
                role: userByEmail.role,
                companyId: userByEmail.companyId
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding user to chat", error: error.message });
    }
}

export const getCompanyUsers = async (req, res) => {
    try {
        const { companyId } = req.params;

        if (!companyId) {
            return res.status(400).json({ message: "Company ID is required" });
        }

        // Find all users (admin, drivers, customers) with this companyId
        // Populate assignedTo to get customer info for drivers
        const users = await User.find({ companyId }).select('_id userName email role companyId assignedTo').populate('assignedTo', '_id userName email role');

        res.status(200).json({
            message: "Company users retrieved successfully",
            users
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching company users", error: error.message });
    }
}
