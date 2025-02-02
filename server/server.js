import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

import connectDB from "./config/db.js";
import dataRoutes from "./routes/dataRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import { WebSocket } from "./WebSocket.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/data", dataRoutes);
app.use("/api/device", deviceRoutes);

app.get("/", (req, res) => {
    res.send({ message: "Welcome to Design Project!" });
});

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
    console.log(`Server Running on ${process.env.DEV_MODE} Mode`);
});

WebSocket(server);

export default app;
