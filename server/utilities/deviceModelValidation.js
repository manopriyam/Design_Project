import mongoose from "mongoose";
import dataModel from "../models/dataModel.js";
import deviceModel from "../models/deviceModel.js";

const MONGODB_URL =
    "mongodb+srv://manopriyam:MygzbANmpiuL65Zd@designproject.jyl5g.mongodb.net/DesignProjectDB";

// const MONGODB_URL =
//     "mongodb+srv://manopriyam:MygzbANmpiuL65Zd@designproject.jyl5g.mongodb.net/DesignProjectDB_Dummy";

// Connect to the database
console.log("Connecting to MongoDB Database:", MONGODB_URL);
await mongoose.connect(MONGODB_URL);

// Clear the deviceModel collection before processing new data
await deviceModel.deleteMany({});
console.log("Cleared Device Model Collection.");

// Get all unique deviceIds from the data collection
const deviceIds = await dataModel.distinct("deviceId");
console.log("All Unique Device IDs:", deviceIds);

for (const deviceId of deviceIds) {
    // Get the latest entry for the current device
    const lastEntry = await dataModel.findOne({ deviceId }).sort({ createdAt: -1 }).lean();
    console.log("\nLast Entry for Device ID:\n", lastEntry);

    // Default pirLastChanged to the latest entry's timestamp
    let pirLastChanged = lastEntry.createdAt;

    // Extract the current pirValue
    const currentPir = lastEntry.pirValue;

    // Find the most recent entry where pirValue is different (i.e., last change)
    const pirChangeEntry = await dataModel
        .findOne({
            deviceId,
            pirValue: { $ne: currentPir },
        })
        .sort({ createdAt: -1 }) // Latest differing entry
        .lean();
    console.log("\nEntry Before PIR Change:\n", pirChangeEntry);

    if (pirChangeEntry) {
        // Find the first entry after pir change (i.e., where new pirValue took effect)
        const afterChangeEntry = await dataModel
            .findOne({
                deviceId,
                createdAt: { $gt: pirChangeEntry.createdAt },
            })
            .sort({ createdAt: 1 }) // Earliest after change
            .lean();

        // Set pirLastChanged to the timestamp of the new value
        pirLastChanged = afterChangeEntry ? afterChangeEntry.createdAt : pirChangeEntry.createdAt;
        console.log("\nEntry After PIR Change:\n", afterChangeEntry);
    }

    // Update or insert the device document with the latest status
    await deviceModel.updateOne(
        { deviceId },
        {
            $set: {
                totalEnergy: lastEntry.energy,
                currentChannel1: lastEntry.channel1,
                currentChannel2: lastEntry.channel2,
                currentChannel3: lastEntry.channel3,
                currentChannel4: lastEntry.channel4,
                pirValue: lastEntry.pirValue,
                pirLastChanged,
                isPico: lastEntry.isPico || true,
                isActive: lastEntry.isActive || false,
            },
        },
        { upsert: true }
    );

    // Fetch and display the newly added device entry
    const newDeviceEntry = await deviceModel.findOne({ deviceId }).lean();
    console.log("\nNew Device Entry Added:\n", newDeviceEntry);
}

// Log completion
console.log("\nDevice Dataset Creation Completed.");

// Disconnect from the database
mongoose.disconnect();
