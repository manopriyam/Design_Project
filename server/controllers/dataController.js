import dataModel from "../models/dataModel.js";

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

export const allDataController = async (req, res) => {
  try {
    const allData = await dataModel.find({});
    res.send({
      success: true,
      message: "All Data Sent Successfully",
      allData,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error in All Data Controller",
      error,
    });
  }
};

export const sendDataController = async (req, res) => {
  try {
    const received = req.body;
    const deviceData = new dataModel(received);
    await deviceData.save();

    res.send({
      success: true,
      message: "Data Received Successfully",
      received,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error in Send Data Controller",
      error,
    });
  }
};

export const statisticsDataController = async(req,res) => {
  try {
    const { deviceId } = req.params;  
    const statistics = await dataModel.find({ deviceId }).select("createdAt energy -_id"); 
        
    if (!statistics) {
      return res.status(404).send({
        success: false,
        message: "Statistics Not Found",
      });
    }

    res.send({
      success: true,
      message: "Statistics Sent Successfully",
      statistics,
    });
  }  catch (error) {
      res.send({
        success: false,
        message: "Error in Statistics Data Controller",
        error, 
    });
  }
};
