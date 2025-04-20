import { deviceConnections } from "./WebSocket.js";
import deviceModel from "./models/deviceModel.js";
import dataModel from "./models/dataModel.js";
import axios from "axios";

const handleInactiveConnections = async (wss) => {
    for (const ws of wss.clients) {
        if (!ws.isAlive) {
            deviceConnections.delete(ws.deviceId);
            console.log(
                `Closing Inactive Connection for Device ID (Current Connections Check): ${ws.deviceId}`
            );
            await deviceModel.findOneAndUpdate(
                { deviceId: ws.deviceId },
                { isActive: false },
                { new: true }
            );
            ws.terminate();
        }

        ws.isAlive = false;
        console.log("Pinging Device: ", ws.deviceId);
        ws.ping();
    }

    const activeDevices = await deviceModel.find({ isActive: true });
    activeDevices.forEach(async (device) => {
        const connectedClient = [...wss.clients].find((ws) => ws.deviceId === device.deviceId);
        if (!connectedClient) {
            await deviceModel.findOneAndUpdate(
                { deviceId: device.deviceId },
                { isActive: false },
                { new: true }
            );
            deviceConnections.delete(device.deviceId);
            console.log(
                `Closing Inactive Connection for Device ID (All Devices Check): ${device.deviceId}`
            );
        }
    });

    let undefined = 0;
    for (const ws of wss.clients) {
        if (!ws.deviceId) {
            undefined++;
            ws.terminate();
        }
    }
    console.log(`Disconnected ${undefined} Undefined Client IDs.`);

    console.log("Currently Active Client IDs: ", wss.clients.size);
    deviceConnections.forEach((client, deviceId) => {
        console.log("Client ID: ", deviceId);
    });
};

const handleInactivePIRDevices = async (wss) => {
    const intervalInMillis = (process.env.PIR_UPDATES_INTERVAL || 15) * 60 * 1000;

    const cutoff = new Date(Date.now() - intervalInMillis);

    const inactiveDevices = await deviceModel.find({
        isActive: true,
        pirValue: false,
        pirLastChanged: { $exists: true, $ne: null, $lte: cutoff },
    });
    console.log(`Inactive Devices with pirLastChanged <= ${cutoff}: `, inactiveDevices);

    for (const device of inactiveDevices) {
        const ws = deviceConnections.get(device.deviceId);

        if (ws && ws.readyState === ws.OPEN) {
            console.log(
                `Device ${device.deviceId} has been inactive for more than ${process.env.PIR_UPDATES_INTERVAL} minutes. Setting all channels to false.`
            );

            const instruction = {
                deviceId: device.deviceId,
                setChannel1: false,
                setChannel2: false,
                setChannel3: false,
                setChannel4: false,
            };

            try {
                const response = await axios.post(
                    `http://localhost:${process.env.PORT || 3000}/api/device/instruction`,
                    instruction
                );
                if (response.data.success) {
                    console.log("Instruction Sent Successfully!");
                } else {
                    console.error("Failed to Send Instruction!");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    }
};

const fetchUpdates = async (wss) => {
    console.log("Fetching Updates...");
    try {
        await handleInactiveConnections(wss);
        await handleInactivePIRDevices(wss);
    } catch (error) {
        console.error("Error in Fetching Updates:", error);
    }
};

export default fetchUpdates;
