import deviceModel from "../models/deviceModel.js";
import { deviceConnections } from "../WebSocket.js";

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
      error,
    });
  }
};

export const allDeviceController = async (req, res) => {
  try {
    const allDevice = await deviceModel.find({});
    res.send({
      success: true,
      message: "All Device Sent Successfully",
      allDevice,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error in All Device Controller",
      error,
    });
  }
};

export const singleDeviceDetailsController = async (req, res) => {
  try {
    const { deviceId } = req.params;  

    const device = await deviceModel.findOne({ deviceId }); 
    
    if (!device) {
      return res.status(404).send({
        success: false,
        message: "Device Not Found",
      });
    }

    res.send({
      success: true,
      message: "Device Details Fetched Successfully",
      device,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error Fetching Device Details",
      error,
    });
  }
};

export const instructionDeviceController = async (req, res) => {
  try {
    const instruction = req.body;

    const ws = deviceConnections.get(instruction.deviceId);

    if (ws && ws.readyState === ws.OPEN) {
      const message = {
        deviceId: instruction.deviceId,
        setChannel1: instruction.setChannel1,
        setChannel2: instruction.setChannel2,
        setChannel3: instruction.setChannel3,
        setChannel4: instruction.setChannel4
      };
      console.log("Instructions Received:\n", message);
      ws.send(`Instructions Received: ${JSON.stringify(message)}`);
      
      const newData = await deviceModel.findOneAndUpdate(
          { deviceId: instruction.deviceId },
          {
              channel1: instruction.setChannel1,
              channel2: instruction.setChannel2,
              channel3: instruction.setChannel3,
              channel4: instruction.setChannel4
          },
          { new: true, upsert: true }
      );
      console.log("New Device Data Added:\n", newData);
      ws.send(`New Device Data Added: ${JSON.stringify(newData)}`);

      const updatedDevice = await deviceModel.findOneAndUpdate(
          { deviceId: instruction.deviceId },
          {
            currentChannel1: instruction.setChannel1,
            currentChannel2: instruction.setChannel2,
            currentChannel3: instruction.setChannel3,
            currentChannel4: instruction.setChannel4,
            isActive: true,
          },
          { new: true, upsert: true }
      );
      console.log("Device Status Updated:\n", updatedDevice);
      ws.send(`Device Status Updated: ${JSON.stringify(updatedDevice)}`);

      res.send({
        success: true,
        message: "Instruction Received and Sent to Device Successfully",
        instruction
      });
    } else {
      res.send({
        success: false,
        message: "Device not connected or WebSocket is closed"
      });
    }
  } catch (error) {
    res.send({
      success: false,
      message: "Error in Instruction Device Controller",
      error,
    });
  }
};
