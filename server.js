// import necessary packages
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";

// importing from files
import connectDB from "./config/db.js"; 
import dataRoutes from "./routes/dataRoutes.js";

// configure dotenv to load environment variables from the .env file
dotenv.config();

// database connection
connectDB();

// initialize the express application
const app = express();

// middlewares
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

// start the server to listen on the specified port
app.listen(PORT, () => {
    console.log(`Server Running on ${process.env.DEV_MODE} Mode at Port ${PORT}\n`);
});
