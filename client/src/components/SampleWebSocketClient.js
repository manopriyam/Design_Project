import fs from "fs";
import React, { useEffect, useState, useRef } from "react";

const WebSocketClient = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = new WebSocket(process.env.REACT_APP_WEBSOCKET_SERVER_URL);

    // Log successful connection
    socketRef.current.onopen = () => {
      console.log("Connected to WebSocket Server");

      const data = JSON.parse(fs.readFileSync("./sampleJSONRequest.json", "utf-8"));

      socketRef.current.send(JSON.stringify(data));
      console.log("Sent:", JSON.stringify(data));
    };

    // Listen for incoming messages
    socketRef.current.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, `Server: ${event.data}`]);
    };

    // Handle WebSocket errors
    socketRef.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    // Handle WebSocket close
    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Cleanup on component unmount
    return () => {
      console.log("Disconnecting from WebSocket Server!");
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const stringObject = JSON.stringify(JSON.parse(newMessage));
      socketRef.current.send(stringObject);
      console.log("Sent:", stringObject);
      setMessages((prevMessages) => [...prevMessages, `You: ${newMessage}`]);
      setNewMessage("");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>WebSocket Communication</h2>
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

export default WebSocketClient;
