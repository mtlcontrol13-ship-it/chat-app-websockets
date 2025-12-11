import 'dotenv/config';
import mongoose from "mongoose";
import connectToDB from "./config/db.js";
import { User } from "./models/User.js";

connectToDB();

const clearAndSeed = async () => {
    try {
        await User.deleteMany({});
        console.log("✓ Database cleared");
        
        // Now run the seed
        const admin1Data = { role: 'admin', email: 'admin@example.com', userName: 'Usman Amin' };
        const admin2Data = { role: 'admin', email: 'admin2@example.com', userName: 'Ahmed Ali' };

        const admin1 = await User.create(admin1Data);
        console.log(`✓ Created admin: ${admin1.userName} with companyId: ${admin1.companyId}`);

        const admin2 = await User.create(admin2Data);
        console.log(`✓ Created admin: ${admin2.userName} with companyId: ${admin2.companyId}`);

        const usersToCreate = [
            { role: 'driver', email: 'driver@example.com', userName: 'Zaid Hafeez', companyId: admin1.companyId },
            { role: 'driver', email: 'driver3@example.com', userName: 'Bilal Aslam', companyId: admin1.companyId },
            { role: 'customer', email: 'customer@example.com', userName: 'Mashhood Rehman', companyId: admin1.companyId },
            { role: 'customer', email: 'customer3@example.com', userName: 'Ayesha Khan', companyId: admin1.companyId },
            { role: 'driver', email: 'driver2@example.com', userName: 'Ali Khan', companyId: admin2.companyId },
            { role: 'driver', email: 'driver4@example.com', userName: 'Omar Farooq', companyId: admin2.companyId },
            { role: 'customer', email: 'customer2@example.com', userName: 'Sara Ahmed', companyId: admin2.companyId },
            { role: 'customer', email: 'customer4@example.com', userName: 'Fatima Noor', companyId: admin2.companyId },
        ];

        const allUsers = await User.create(usersToCreate);
        allUsers.forEach(u => console.log(`✓ Created user: ${u.userName} (${u.role})`));

        // Assign drivers to customers
        const assignments = [
            { driverEmail: 'driver@example.com', customerEmail: 'customer@example.com' },
            { driverEmail: 'driver3@example.com', customerEmail: 'customer3@example.com' },
            { driverEmail: 'driver2@example.com', customerEmail: 'customer2@example.com' },
            { driverEmail: 'driver4@example.com', customerEmail: 'customer4@example.com' },
        ];

        for (const { driverEmail, customerEmail } of assignments) {
            const driver = await User.findOne({ email: driverEmail });
            const customer = await User.findOne({ email: customerEmail });
            if (driver && customer) {
                driver.assignedTo = customer._id;
                await driver.save();
                console.log(`✓ Assigned driver ${driver.userName} to customer ${customer.userName}`);
            }
        }

        console.log("\n✓ Seeding complete!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

clearAndSeed();
