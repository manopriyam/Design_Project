import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { WebSocketServer } from "ws";

// importing from files
import connectDB from "./config/db.js";
import dataRoutes from "./routes/dataRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";

// import data model
import dataModel from "./models/dataModel.js";
import deviceModel from "./models/deviceModel.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/data", dataRoutes);
app.use("/api/device", deviceRoutes);

// root API endpoint
app.get("/", (req, res) => {
    res.send({
        message: "Welcome to Design Project!\n",
    });
});

// set the port from environment variables or default to 8080 if not specified
const PORT = process.env.PORT || 8080;

// start HTTP server
const server = app.listen(PORT, () => {
    console.log(`Server Running on ${process.env.DEV_MODE} Mode`);
});

// Setup WebSocket server
const wss = new WebSocketServer({ server });

// handle WebSocket connections
wss.on("connection", (ws) => {
    console.log("New WebSocket Client Connected.");
    console.log(`Currently Connected : ${wss.clients.size} Clients`);

  // Listen for messages from the client
    ws.on("message", async (message) => {
        const textMessage = message.toString("utf-8");

        try {
            const data = JSON.parse(textMessage);        
            ws.deviceId = data.deviceId;

            const newData = new dataModel(data);
            await newData.save();
            console.log("New Device Data Added:\n", newData);
            ws.send(`Data Received by Server: ${JSON.stringify(data)}`);

            const existingDevice = await deviceModel.findOne({ deviceId: data.deviceId });
            if (existingDevice) {
                existingDevice.totalEnergy += data.energy;
                existingDevice.currentChannel1 = data.channel1;
                existingDevice.currentChannel2 = data.channel2;
                existingDevice.currentChannel3 = data.channel3;
                existingDevice.currentChannel4 = data.channel4;
                existingDevice.isPico = true; // websocket connections only are Pico based
                existingDevice.isActive = true;
                await existingDevice.save();

                console.log("Device Status Updated in Device List:\n", existingDevice);
                ws.send(`Device Status Updated in Device List: ${JSON.stringify(existingDevice)}`);
            } else {
                const newDevice = new deviceModel();
                newDevice.deviceId = data.deviceId;
                newDevice.totalEnergy = data.energy;
                newDevice.currentChannel1 = data.channel1;
                newDevice.currentChannel2 = data.channel2;
                newDevice.currentChannel3 = data.channel3;
                newDevice.currentChannel4 = data.channel4;
                newDevice.isPico = true; // websocket connections only are Pico based
                newDevice.isActive = true;
                await newDevice.save();

                console.log("New Device Status Added to Device List:\n", newDevice);
                ws.send(`New Device Status Added to Device List: ${JSON.stringify(newDevice)}`);
            }
        } catch (error) {
            console.error(error);
        }
    });

    // Handle client disconnection
    ws.on("close", async () => {
        console.log("Connection Closed.");
        console.log(`Currently Connected : ${wss.clients.size} Clients`);
        const deviceId = ws.deviceId; // Access deviceId stored in the WebSocket connection
    
        if (deviceId) {
            const existingDevice = await deviceModel.findOne({ deviceId });
            if (existingDevice) {
                existingDevice.isActive = false; 
                await existingDevice.save();
                console.log(`Device Status Updated in Device List:\n ${existingDevice}`);
            }
        }
    });

    // Send initial message to the client
    ws.send("Client Successfully Connected to the Server!");
});

export default app;
