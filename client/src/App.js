import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./App.css"
import ActiveDevicesList from "./pages/ActiveDevicesList.js";
import DevicePage from "./pages/DevicePage.js";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ActiveDevicesList />} />
          <Route path="/device/:deviceId" element={<DevicePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
