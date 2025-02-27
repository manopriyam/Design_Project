import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./DevicePage.css";
import RealTimeStatistics from "../components/RealTimeStatistics";

const DevicePage = () => {
  const { deviceId } = useParams();
  const [device, setDevice] = useState({});
  const [setChannel1, setSetChannel1] = useState(false);
  const [setChannel2, setSetChannel2] = useState(false);
  const [setChannel3, setSetChannel3] = useState(false);
  const [setChannel4, setSetChannel4] = useState(false);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_HTTP_SERVER_URL}/api/device/details/${deviceId}`
        );
        if (response.ok) {
          const data = await response.json();
          setDevice(data.device);
          setSetChannel1(data.device.currentChannel1);
          setSetChannel2(data.device.currentChannel2);
          setSetChannel3(data.device.currentChannel3);
          setSetChannel4(data.device.currentChannel4);
        } else {
          console.error("Error fetching device data");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchDevice();

    const intervalId = setInterval(fetchDevice, process.env.REACT_APP_FETCH_UPDATES_INTERVAL * 1000 || 15000);

    return () => clearInterval(intervalId);
  }, [deviceId]);

  const handleToggle = async (updatedState) => {
    const instruction = {
      deviceId,
      setChannel1: updatedState.setChannel1,
      setChannel2: updatedState.setChannel2,
      setChannel3: updatedState.setChannel3,
      setChannel4: updatedState.setChannel4,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_HTTP_SERVER_URL}/api/device/instruction`,
        instruction
      );
      if (response.data.success) {
        console.log(instruction);
        toast.success("Instruction Sent Successfully!");
        setDevice((prevDevice) => ({
          ...prevDevice,
          currentChannel1: updatedState.setChannel1,
          currentChannel2: updatedState.setChannel2,
          currentChannel3: updatedState.setChannel3,
          currentChannel4: updatedState.setChannel4,
        }));
      } else {
        toast.error("Failed to Send Instruction!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error Sending Instruction");
    }
  };

  const handleSwitchChange = (setChannel) => {
    const updatedState = {
      setChannel1: setChannel1,
      setChannel2: setChannel2,
      setChannel3: setChannel3,
      setChannel4: setChannel4,
    };
  
    if (setChannel === "setChannel1") {
      setSetChannel1(!setChannel1);
      updatedState.setChannel1 = !setChannel1;
    }
    if (setChannel === "setChannel2") {
      setSetChannel2(!setChannel2);
      updatedState.setChannel2 = !setChannel2;
    }
    if (setChannel === "setChannel3") {
      setSetChannel3(!setChannel3);
      updatedState.setChannel3 = !setChannel3;
    }
    if (setChannel === "setChannel4") {
      setSetChannel4(!setChannel4);
      updatedState.setChannel4 = !setChannel4;
    }
  
    handleToggle(updatedState);
  };

  return (
    <div className="device-page-container">
      <h2>Device: {device.deviceId}</h2>
      <RealTimeStatistics deviceId={device.deviceId}/>
      <div className="device-layout">
        <div className="device-stats">
          <h3>Device Statistics</h3>
          <table className="device-table">
            <thead>
              <tr>
                <th width="300px">Property</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Status</td>
                <td>{device.isActive ? "Active" : "Inactive"}</td>
              </tr>
              <tr>
                <td>Raspberry Pico</td>
                <td>{device.isPico ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td>Total Energy</td>
                <td>{device.totalEnergy}</td>
              </tr>
              <tr>
                <td>Channel 1</td>
                <td>{device.currentChannel1 ? "Active" : "Inactive"}</td>
              </tr>
              <tr>
                <td>Channel 2</td>
                <td>{device.currentChannel2 ? "Active" : "Inactive"}</td>
              </tr>
              <tr>
                <td>Channel 3</td>
                <td>{device.currentChannel3 ? "Active" : "Inactive"}</td>
              </tr>
              <tr>
                <td>Channel 4</td>
                <td>{device.currentChannel4 ? "Active" : "Inactive"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="device-controls">
          <h3>Control Channels</h3>
          <table className="channel-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Control</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Channel 1</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={setChannel1}
                      onChange={() => handleSwitchChange("setChannel1")}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
              </tr>
              <tr>
                <td>Channel 2</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={setChannel2}
                      onChange={() => handleSwitchChange("setChannel2")}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
              </tr>
              <tr>
                <td>Channel 3</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={setChannel3}
                      onChange={() => handleSwitchChange("setChannel3")}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
              </tr>
              <tr>
                <td>Channel 4</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={setChannel4}
                      onChange={() => handleSwitchChange("setChannel4")}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DevicePage;
