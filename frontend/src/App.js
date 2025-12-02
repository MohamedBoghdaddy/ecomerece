import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home/Home";
import NavBar from "./components/Home/NavBar";
import Footer from "./components/Home/Footer";

import Login from "./components/LOGIN&REGISTRATION/Login/Login";
import Signup from "./components/LOGIN&REGISTRATION/Signup/Signup";
import Contact from "./components/Contact/contact";
// import cart from "./cart.html"
function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
