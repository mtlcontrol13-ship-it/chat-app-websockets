import 'dotenv/config';
import mongoose from "mongoose";
import connectToDB from "../config/db.js";
import { User } from "../models/User.js";

connectToDB();

const seedUsers = async () => {
    try {
        // First, create or get admins (they auto-generate companyId)
        const admin1Data = { role: 'admin', email: 'admin@example.com', userName: 'Usman Amin' };
        const admin2Data = { role: 'admin', email: 'admin2@example.com', userName: 'Ahmed Ali' };

        let admin1 = await User.findOne({ email: admin1Data.email });
        if (!admin1) {
            admin1 = await User.create(admin1Data);
            console.log(`✓ Created admin: ${admin1.userName} with companyId: ${admin1.companyId}`);
        } else {
            console.log(`⊘ Admin already exists: ${admin1.userName} (companyId: ${admin1.companyId})`);
        }

        let admin2 = await User.findOne({ email: admin2Data.email });
        if (!admin2) {
            admin2 = await User.create(admin2Data);
            console.log(`✓ Created admin: ${admin2.userName} with companyId: ${admin2.companyId}`);
        } else {
            console.log(`⊘ Admin already exists: ${admin2.userName} (companyId: ${admin2.companyId})`);
        }

        // Now create users under each admin's company
        const usersToCreate = [
            // Admin1's company users
            { role: 'driver', email: 'driver@example.com', userName: 'Zaid Hafeez', companyId: admin1.companyId },
            { role: 'driver', email: 'driver3@example.com', userName: 'Bilal Aslam', companyId: admin1.companyId },
            { role: 'customer', email: 'customer@example.com', userName: 'Mashhood Rehman', companyId: admin1.companyId },
            { role: 'customer', email: 'customer3@example.com', userName: 'Ayesha Khan', companyId: admin1.companyId },
            // Admin2's company users
            { role: 'driver', email: 'driver2@example.com', userName: 'Ali Khan', companyId: admin2.companyId },
            { role: 'driver', email: 'driver4@example.com', userName: 'Omar Farooq', companyId: admin2.companyId },
            { role: 'customer', email: 'customer2@example.com', userName: 'Sara Ahmed', companyId: admin2.companyId },
            { role: 'customer', email: 'customer4@example.com', userName: 'Fatima Noor', companyId: admin2.companyId },
        ];

        let createdCount = 0;
        let skippedCount = 0;

        for (const userData of usersToCreate) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                await User.create(userData);
                console.log(`✓ Created user: ${userData.userName} (${userData.role}) under company ${userData.companyId}`);
                createdCount++;
            } else {
                console.log(`⊘ User already exists: ${userData.userName} (${userData.role})`);
                skippedCount++;
            }
        }

        console.log(`\nSeeding summary: ${createdCount} users created, ${skippedCount} skipped`);
    } catch (error) {
        console.error("Error during database seeding:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

seedUsers();