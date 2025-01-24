import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SocketIOClient = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    // Create and store the socket instance
    socketRef.current = io(process.env.REACT_APP_SERVER_URL);

    console.log(process.env.REACT_APP_SERVER_URL, socketRef.current);

    // Log successful connection
    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket Server");

      const data = {
        "deviceId": "deviceSomeRandomFromClient",
        "energy": 320,
        "channel1": false,
        "channel2": true,
        "channel3": true,
        "channel4": true,
      };

      socketRef.current.emit("message", JSON.stringify(data));
      console.log(JSON.stringify(data))
    });

    // Listen for incoming messages
    socketRef.current.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, `Server: ${message}`]);
    });

    // Cleanup on component unmount
    return () => {
      console.log("Disconnecting from Server!");
      socketRef.current.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Use the persistent socket instance
      const stringObject = JSON.stringify(JSON.parse(newMessage));
      socketRef.current.emit("message", stringObject);
      console.log(stringObject);
      setMessages((prevMessages) => [...prevMessages, `You: ${newMessage}`]);
      setNewMessage("");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Socket.IO Communication</h2>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "10px",
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        {messages.map((msg, index) => (
          <p key={index} style={{ margin: 0 }}>
            {msg}
          </p>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          style={{ padding: "5px", width: "80%" }}
        />
        <button onClick={sendMessage} style={{ padding: "5px", marginLeft: "5px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default SocketIOClient;
