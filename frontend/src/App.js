import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home/Home";
import NavBar from "./components/Home/NavBar";
import Footer from "./components/Home/Footer";

import Login from "./components/LOGIN&REGISTRATION/Login/Login";
import Signup from "./components/LOGIN&REGISTRATION/Signup/Signup";
import Contact from "./components/Contact/contact";
import HtmlLoader from "./components/HtmlLoader";
function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              <Footer />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<HtmlLoader file="cart.html" />} />
        <Route path="/favorite" element={<HtmlLoader file="favorite.html" />} />
        <Route path="/crud" element={<HtmlLoader file="crud.html" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
