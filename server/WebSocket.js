import { WebSocketServer } from "ws";
import deviceModel from "./models/deviceModel.js";
import dataModel from "./models/dataModel.js";

const deviceConnections = new Map();

const WebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log("New WebSocket Client Connected.");
        console.log(`Currently Connected : ${wss.clients.size} Clients`);

        ws.isAlive = true;

        ws.on("pong", () => {
            console.log("Pong Received from Device: ", ws.deviceId);
            ws.isAlive = true;
        });

        ws.on("message", async (message) => {
            const textMessage = message.toString("utf-8");

            try {
                const data = JSON.parse(textMessage);
                ws.deviceId = data.deviceId;

                deviceConnections.set(ws.deviceId, ws);
        
                const newData = new dataModel(data);
                await newData.save();
                console.log("New Device Data Added:\n", newData);
                ws.send(`New Device Data Added: ${JSON.stringify(data)}`);

                const updatedDevice = await deviceModel.findOneAndUpdate(
                    { deviceId: data.deviceId },
                    {
                        totalEnergy: data.energy,
                        currentChannel1: data.channel1,
                        currentChannel2: data.channel2,
                        currentChannel3: data.channel3,
                        currentChannel4: data.channel4,
                        isPico: true,
                        isActive: true
                    },
                    { new: true, upsert: true }
                );

                console.log("Device Status Updated:\n", updatedDevice);
                ws.send(`Device Status Updated: ${JSON.stringify(updatedDevice)}`);
            } catch (error) {
                console.error(error);
            }
        });

        ws.on("close", async () => {
            deviceConnections.delete(ws.deviceId);

            console.log("Connection Closed.");
            console.log(`Currently Connected : ${wss.clients.size} Clients`);

            await deviceModel.findOneAndUpdate(
                { deviceId: ws.deviceId },
                { isActive: false },
                { new: true }
            );
            console.log("Device Status Updated to Inactive.");
        });

        ws.send("Client Successfully Connected to the Server!");
    });

    setInterval(async () => {
        wss.clients.forEach(async (ws) => {
            if (ws.isAlive === false) {
                deviceConnections.delete(ws.deviceId);
                console.log(`Closing Inactive Connection for Device ID (Current Connections Check): ${ws.deviceId}`);
                await deviceModel.findOneAndUpdate(
                    { deviceId: ws.deviceId },
                    { isActive: false },
                    { new: true }
                );
                return ws.terminate();
            }

            ws.isAlive = false;
            console.log("Pinging Device: ", ws.deviceId);
            ws.ping();
        });

        const activeDevices = await deviceModel.find({ isActive: true });
        activeDevices.forEach(async (device) => {
            const connectedClient = [...wss.clients].find((ws) => ws.deviceId === device.deviceId);
            if (!connectedClient) {
                await deviceModel.findOneAndUpdate(
                    { deviceId: device.deviceId },
                    { isActive: false },
                    { new: true }
                );
                console.log(`Closing Inactive Connection for Device ID (All Devices Check): ${device.deviceId}`);
            }
        });
    }, process.env.DEVICE_ACTIVITY_CHECK_INTERVAL * 1000 || 15000);
};

export { WebSocket, deviceConnections };
