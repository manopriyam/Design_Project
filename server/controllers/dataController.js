import deviceModel from "../models/deviceModel.js";

export const testController = async (req, res) => {
    try {
        res.send({
            success: true,
            message: "Test is Working Fine",
        });
    } catch (error) {
        res.send({
            success: false,
            message: "Error in Test Controller",
            error
        });
    }
}

export const allDataController = async (req, res) => {
    try {
        const allData = await deviceModel.find({});
        res.send({
            success: true,
            message: "All Data Sent Successfully",
            allData
        });
    } catch (error) {
        res.send({
            success: false,
            message: "Error in All Data Controller",
            error
        });
    }
}

export const sendDataController = async (req, res) => {
    try {
        const received = req.body;
        const deviceData = new deviceModel(received);
        await deviceData.save();

        res.send({
            success: true,
            message: "Data Received Successfully",
            received
        });
    } catch (error) {
        res.send({
            success: false,
            message: "Error in Send Data Controller",
            error
        });
    }
}