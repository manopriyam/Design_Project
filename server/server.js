import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { WebSocketServer } from "ws";

// importing from files
import connectDB from "./config/db.js"; 
import dataRoutes from "./routes/dataRoutes.js";

// import device model
import deviceModel from './models/deviceModel.js'; 

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use('/api/device', dataRoutes);

// root API endpoint
app.get('/', (req, res) => {
    res.send({
        message: 'Welcome to Design Project!\n'
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
wss.on('connection', (ws) => {
    console.log('New WebSocket Client Connected.');
    console.log(`Currently Connected : ${wss.clients.size} Clients`);

    // Listen for messages from the client
    ws.on('message', async (message) => {   
        const textMessage = message.toString('utf-8'); 

        try {
            const deviceData = JSON.parse(textMessage);
            const newDevice = new deviceModel(deviceData);
            await newDevice.save();
            console.log('New Device Data Added:\n', newDevice);
            ws.send(`Data Received by Server: ${JSON.stringify(deviceData)}`);
        } catch (error) {
            console.error(error);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Connection Closed.');
        console.log(`Currently Connected : ${wss.clients.size} Clients`);
    });

    // Send initial message to the client
    ws.send('Client Successfully Connected to the Server!');
});

export default app;
