import { WebSocketServer } from "ws";
import deviceModel from "./models/deviceModel.js";
import dataModel from "./models/dataModel.js";
import fetchUpdates from "./fetchUpdates.js";

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

                console.log("JSON Data Received:\n", data);
                deviceConnections.set(ws.deviceId, ws);

                const lastEntry = await dataModel
                    .findOne({ deviceId: data.deviceId })
                    .sort({ createdAt: -1 });

                const newData = new dataModel(data);
                await newData.save();
                console.log("New Device Data Added:\n", newData);
                ws.send(`New Device Data Added: ${JSON.stringify(newData)}`);

                const updatePIR = !lastEntry || lastEntry.pirValue != data.pirValue;
                if (updatePIR) {
                    data.pirLastChanged = new Date();
                }

                const updatedDevice = await deviceModel.findOneAndUpdate(
                    { deviceId: data.deviceId },
                    {
                        totalEnergy: data.energy,
                        currentChannel1: data.channel1,
                        currentChannel2: data.channel2,
                        currentChannel3: data.channel3,
                        currentChannel4: data.channel4,
                        isPico: true,
                        isActive: true,
                        pirValue: data.pirValue,
                        pirLastChanged: data.pirLastChanged,
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
        ws.send(
            `Note: You must send data to the Web Socket Server at intervals of less than ${process.env.FETCH_UPDATES_INTERVAL} seconds, to prevent disconnection.`
        );
    });

    setInterval(() => {
        fetchUpdates(wss);
    }, process.env.FETCH_UPDATES_INTERVAL * 1000 || 15000);
};

export { WebSocket, deviceConnections };
