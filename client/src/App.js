import React from "react";
import SocketIOClient from "./components/SocketIOClient.js";

const App = () => {
  return (
    <div>
      <h1>WebSocket Client</h1>
      <SocketIOClient />
    </div>
  );
};

export default App;
