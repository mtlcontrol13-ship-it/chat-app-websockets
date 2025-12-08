import 'dotenv/config';
import mongoose from "mongoose";
import connectToDB from "../config/db.js";
import { User } from "../models/User.js";

connectToDB();

const seedUsers = async () => {
    try {
        const users = [
            { role: 'admin', email: 'admin@example.com', userName: 'Usman Amin' },
            { role: 'driver', email: 'driver@example.com', userName: 'Zaid Hafeez' },
            { role: 'customer', email: 'customer@example.com', userName: 'Mashhood Rehman' },
        ];

        let createdCount = 0;
        let skippedCount = 0;

        for (const userData of users) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                await User.create(userData);
                console.log(`✓ Created user: ${userData.userName} (${userData.role})`);
                createdCount++;
            } else {
                console.log(`⊘ User already exists: ${userData.userName} (${userData.role})`);
                skippedCount++;
            }
        }

        console.log(`\nSeeding summary: ${createdCount} created, ${skippedCount} skipped`);
    } catch (error) {
        console.error("Error during database seeding:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

seedUsers();