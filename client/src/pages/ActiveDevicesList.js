import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";

import "./ActiveDevicesList.css";

const ActiveDevicesList = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchActiveDevices = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_HTTP_SERVER_URL}/api/device/all`);
        if (response.ok) {
          const data = await response.json();
          setDevices(data.allDevice);
          toast.success("Device List Updated!");
        } else {          
          toast.error("Error Fetching Device List!");
        }
      } catch (error) {
        toast.error("Error Fetching Device List!");
        console.error("Error:", error);
      }
    };

    fetchActiveDevices();

    const intervalId = setInterval(fetchActiveDevices, process.env.REACT_APP_FETCH_UPDATES_INTERVAL * 1000 || 15000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="active-device-table-container">
      <h2 className="active-device-table-header">List of Active Devices</h2>
      <table className="active-device-table">
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Total Energy</th>
            <th>Channel 1</th>
            <th>Channel 2</th>
            <th>Channel 3</th>
            <th>Channel 4</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.deviceId}>
              <td>
                <Link to={`/device/${device.deviceId}`}>
                  {device.deviceId}
                </Link>
              </td>
              <td>{device.totalEnergy}</td>
              <td>{device.currentChannel1 ? "ON" : "OFF"}</td>
              <td>{device.currentChannel2 ? "ON" : "OFF"}</td>
              <td>{device.currentChannel3 ? "ON" : "OFF"}</td>
              <td>{device.currentChannel4 ? "ON" : "OFF"}</td>
              <td>{device.isActive ? "✅ Active" : "❌ Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>      
      <ToastContainer hideProgressBar autoClose={process.env.REACT_APP_TOAST_DURATION * 1000 || 5000} />    
    </div>
  );
};

export default ActiveDevicesList;