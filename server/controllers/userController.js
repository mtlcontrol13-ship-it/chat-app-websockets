import { User } from "../models/User";

export const addUserToChat = async (req, res) => {
    try {
        const { email, currentUserEmail, companyId, role } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Please enter an email address" });
        }

        // Check if user is trying to add themselves
        if (email === currentUserEmail) {
            return res.status(400).json({ message: "You can't add yourself. Please enter someone else's email." });
        }

        if (!companyId) {
            return res.status(400).json({ message: "Please enter your Company ID" });
        }

        // Validate UUID format (8-4-4-4-12 pattern)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(companyId)) {
            return res.status(400).json({ message: "The Company ID format looks incorrect. Please double-check and try again." });
        }

        // First check if user exists by email
        const userByEmail = await User.findOne({ email });
        if (!userByEmail) {
            return res.status(404).json({ message: "This email is not registered. Please ask them to register first." });
        }

        // Validate that the role provided matches the user's actual role
        if (role && userByEmail.role !== role) {
            return res.status(400).json({ message: `The user ${userByEmail.userName} has role "${userByEmail.role}", not "${role}". Please select the correct role.` });
        }

        // Assign the admin's companyId to the user
        userByEmail.companyId = companyId;
        await userByEmail.save();

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
