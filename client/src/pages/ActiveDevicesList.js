import React, { useEffect, useState } from "react";
import "./ActiveDevicesList.css"

const ActiveDevicesList = () => {
  const [devices, setDevices] = useState([]);

  // Fetch active devices from the API
  useEffect(() => {
    const fetchActiveDevices = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_HTTP_SERVER_URL}/api/device/all`); 
        if (response.ok) {
          const data = await response.json();
          setDevices(data.allDevice);
        } else {
          console.error("Error fetching devices data");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchActiveDevices();
  }, []);

  return (
    <div className="device-table-container">
      <h2>Active Devices</h2>
      <table className="device-table">
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Total Energy</th>
            <th>Current Channels</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            device.isActive && (
              <tr key={device.deviceId}>
                <td>{device.deviceId}</td>
                <td>{device.totalEnergy}</td>
                <td>
                  {device.currentChannel1}, {device.currentChannel2}, 
                  {device.currentChannel3}, {device.currentChannel4}
                </td>
                <td>{device.isActive ? "Active" : "Inactive"}</td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveDevicesList;
