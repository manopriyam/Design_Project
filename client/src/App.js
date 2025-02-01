import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ActiveDevicesList from "./pages/ActiveDevicesList.js";

const App = () => {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>Active Devices</h1>
        </header>

        <Routes>
          <Route path="/" element={<ActiveDevicesList />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
