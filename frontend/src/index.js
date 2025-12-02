import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { AuthProvider } from "./components/context/AuthContext";
// import { DashboardProvider } from "./components/context/DashboardContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    {/* <DashboardProvider> */}
      <App />
    {/* </DashboardProvider> */}
  </AuthProvider>
);
