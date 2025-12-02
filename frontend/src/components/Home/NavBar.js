import { useState } from "react";
import {
  Navbar,
  Nav,
  Container,
  Form,
  NavDropdown,
  Modal,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCartShopping,
  faUser,
  faHeart,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../Assets/Images/eco-logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/navbar.css";
import Login from "../LOGIN&REGISTRATION/Login/Login.js";
import { useAuthContext } from "../context/AuthContext";
import SearchResultsList from "./SearchResult";

const NavBar = () => {
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [expanded, setExpanded] = useState(false);

  // 🔥 Safe Auth destructuring
  const auth = useAuthContext() || {};
  const { user = null, isAuthenticated = false, logout } = auth;

  const navigate = useNavigate();

  const handleSearch = () => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((json) => {
        const results = json.filter((user) =>
          user.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setSearchResults(results);
      })
      .catch((error) => console.error("Error fetching search results:", error));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      handleSearch();
    }
  };

  const handleLoginModalOpen = () => setShowLoginModal(true);
  const handleLoginModalClose = () => setShowLoginModal(false);
  const handleNavCollapse = () => setExpanded(!expanded);

  const handleLogout = async () => {
    if (logout) await logout();
    navigate("/");
  };

  return (
    <Navbar
      expand="lg"
      className={`premium-navbar ${expanded ? "expanded" : ""}`}
      fixed="top"
    >
      <Container className="nav-inner">
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="nav-logo">
          <img src={logo} alt="HEDJ Logo" />
        </Navbar.Brand>

        {/* Toggler */}
        <Navbar.Toggle
          aria-controls="nav-menu"
          className="nav-toggler"
          onClick={() => setExpanded(!expanded)}
        />

        <Navbar.Collapse id="nav-menu">
          <Nav className="ms-auto nav-links">
            <Nav.Link as={Link} to="/" className="nav-item-link">
              Home
            </Nav.Link>

            <NavDropdown
              title="Products"
              id="nav-products"
              className="nav-item-dropdown"
            >
              {[
                { route: "/Kitchen", label: "KITCHEN" },
                { route: "/Bedroom", label: "BEDROOM" },
                { route: "/DayComplement", label: "DAY COMPLEMENTS" },
                { route: "/NightComplement", label: "NIGHT COMPLEMENTS" },
                { route: "/Outdoor", label: "OUTDOOR" },
              ].map(({ route, label }) => (
                <NavDropdown.Item
                  key={route}
                  as={Link}
                  to={route}
                  className="dropdown-item-premium"
                >
                  {label}
                </NavDropdown.Item>
              ))}
            </NavDropdown>

            <Nav.Link as={Link} to="/contact" className="nav-item-link">
              Contact
            </Nav.Link>

            <Nav.Link as={Link} to="./CrudPage.js" className="nav-item-link">
              CRUD Products
            </Nav.Link>

            {/* Icons Group */}
            <Nav className="nav-icons">
              <Nav.Link as={Link} to="/wishlist" className="icon-link">
                <FontAwesomeIcon icon={faHeart} />
              </Nav.Link>

              {isAuthenticated ? (
                <Nav.Link onClick={handleLogout} className="icon-link">
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </Nav.Link>
              ) : (
                <Nav.Link
                  className="icon-link"
                  onClick={() => setShowLoginModal(true)}
                >
                  <FontAwesomeIcon icon={faUser} />
                </Nav.Link>
              )}

              <Nav.Link as={Link} to="../../../public/cart.html" className="icon-link">
                <FontAwesomeIcon icon={faCartShopping} />
                <span className="cart-count">0</span>
              </Nav.Link>
            </Nav>
          </Nav>

          {/* Search */}
          <div className="premium-search">
            <input
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
          </div>
        </Navbar.Collapse>

        {/* Login Modal */}
        <Modal
          show={showLoginModal}
          onHide={() => setShowLoginModal(false)}
          centered
        >
          <Modal.Header closeButton />
          <Modal.Body>
            <Login />
          </Modal.Body>
        </Modal>
      </Container>
    </Navbar>
  );
};

export default NavBar;
