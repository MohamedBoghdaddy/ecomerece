import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaCouch,
  FaChartLine,
  FaTools,
  FaEye,
  FaEdit,
  FaUsers,
} from "react-icons/fa";
import { BsPersonCircle } from "react-icons/bs";
import { Modal, Button } from "react-bootstrap";
import "../Styles/Sidebar.css";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";

const Sidebar = () => {
  const { state } = useAuthContext();
  const { user, isAuthenticated } = state;

  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);

  // Load profile photo from localStorage
  useEffect(() => {
    const savedPhoto = localStorage.getItem("profilePhoto");
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }
  }, []);

  // Toggle editor
  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    setImage(null);
  };

  // File change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setError("");
      localStorage.removeItem("profilePhoto");
    }
  };

  // Draw image manually onto canvas (instead of avatar-editor)
  useEffect(() => {
    if (image && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();

      img.onload = () => {
        const canvas = canvasRef.current;
        const size = 150;

        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);

        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
      };

      img.src = URL.createObjectURL(image);
    }
  }, [image, scale, rotate]);

  // Save profile photo
  const handleSave = async () => {
    if (!canvasRef.current) return;

    const dataUrl = canvasRef.current.toDataURL("image/png");

    try {
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const formData = new FormData();
      formData.append("photoFile", blob, "profile-photo.png");

      const response = await axios.put(
        `http://localhost:8000/api/users/update/${user._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const updatedPhoto = response.data.user.profilePhoto;
      setProfilePhoto(updatedPhoto);
      localStorage.setItem("profilePhoto", updatedPhoto);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to upload profile photo.");
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>{isAuthenticated ? `Welcome, ${user.username}` : "Guest"}</h2>

        {isAuthenticated && (
          <div className="profile-photo-section">
            {/* DISPLAY PROFILE PHOTO */}
            <img
              src={`http://localhost:8000${profilePhoto}`}
              alt="Profile"
              className="profile-photo"
            />

            <div className="icon-buttons">
              <button onClick={toggleEdit}>
                <FaEdit />
              </button>
              <button onClick={() => setShowPreview(true)}>
                <FaEye />
              </button>
            </div>

            {/* EDIT PHOTO SECTION */}
            {isEditing && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {image && (
                  <div className="avatar-editor">
                    <canvas
                      ref={canvasRef}
                      width={150}
                      height={150}
                      style={{
                        borderRadius: "50%",
                        boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                      }}
                    />

                    <div className="controls">
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                      />

                      <Button
                        variant="secondary"
                        onClick={() => setRotate((r) => r + 90)}
                      >
                        Rotate
                      </Button>

                      <Button variant="success" onClick={handleSave}>
                        Save Photo
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {error && <p className="error-message">{error}</p>}
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Profile Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={`http://localhost:8000${profilePhoto}`}
            alt="Preview"
            className="img-fluid"
            style={{ borderRadius: "50%" }}
          />
        </Modal.Body>
      </Modal>

      {/* MENU */}
      <ul className="sidebar-menu">
        <li>
          <Link to="/Reports">
            <FaChartLine /> Analytics
          </Link>
        </li>
        <li>
          <Link to="/customers">
            <BsPersonCircle /> Customers
          </Link>
        </li>
        <li>
          <Link to="/employees">
            <BsPersonCircle /> Employees
          </Link>
        </li>
        <li>
          <Link to="/products">
            <FaCouch /> Products
          </Link>
        </li>
        <li>
          <Link to="/Profile">
            <FaUsers /> Profile
          </Link>
        </li>
        <li>
          <Link to="/settings">
            <FaTools /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default React.memo(Sidebar);
