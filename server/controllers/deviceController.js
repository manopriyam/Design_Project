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
