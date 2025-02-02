import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const DevicePage = () => {
  const { deviceId } = useParams();
  const [device, setDevice] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_HTTP_SERVER_URL}/api/device/${deviceId}`)
      .then((res) => res.json())
      .then((data) => setDevice(data))
      .catch((err) => console.error("Error fetching device:", err));
  }, [deviceId]);

  const toggleChannel = (channel) => {
    fetch(`${process.env.REACT_APP_HTTP_SERVER_URL}/api/device/${deviceId}/toggleChannel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel }),
    })
      .then((res) => res.json())
      .then((updatedDevice) => setDevice(updatedDevice))
      .catch((err) => console.error("Error toggling channel:", err));
  };

  if (!device) return <h2>Loading...</h2>;

  return (
    <div className="device-table-container">
      <h2>⚡ Device Details - {deviceId}</h2>
      <p>Total Energy: {device.totalEnergy}</p>
      <p>Status: {device.isActive ? "✅ Active" : "❌ Inactive"}</p>

      <h3>🔌 Channels</h3>
      {["currentChannel1", "currentChannel2", "currentChannel3", "currentChannel4"].map((ch, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <span style={{ marginRight: "10px" }}>{ch}: {device[ch] ? "🟢 ON" : "🔴 OFF"}</span>
          <button onClick={() => toggleChannel(ch)}>
            {device[ch] ? "Turn OFF" : "Turn ON"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default DevicePage;
