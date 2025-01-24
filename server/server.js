import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

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

// Setup Socket.IO server
const io = new SocketIOServer(server, {cors: {origin: "*"}});

// handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('New Client-Server Connection Established.');
    console.log(`Currently Connected : ${io.engine.clientsCount} Clients`);

    // Listen for messages from the client
    socket.on('message', async (message) => {
        const textMessage = message.toString('utf-8');
        
        try {
            const deviceData = JSON.parse(textMessage);
            const newDevice = new deviceModel(deviceData);
            await newDevice.save();
            console.log('New Device Data Added:\n', newDevice);
            socket.emit('message', `Data Received by Server: ${JSON.stringify(deviceData)}`);
        } catch (error) {
            console.error(error);
        }
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Connection Closed.');
    });

    // Send initial message to the client
    socket.emit('message', 'Client Successfully Connected to the Server!');
});

export default app;
