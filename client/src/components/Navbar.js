import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../static/navbar.css';
import logo from '../static/images/raysoniclogo.png';

function Navbar({ username, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Function to determine if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div>
      <div className="image_container">
        <img src={logo} alt="Login" className="navbarlogo" />
      </div>
     
      <div className="left_bottom" id="left_bottomid">
        <div className="up">
          
          <Link to="/homepage" className={`nav_link ${isActive('/homepage') ? 'active' : '' }` }>
          <i class="fa-solid fa-house"></i> Dashboard
          </Link>
          <Link to="/monitor" className={`nav_link ${isActive('/monitor') ? 'active' : ''}`}>
            <i className="fas fa-tv"></i> Live Surveillance
          </Link>
          <Link to="/weapon" className={`nav_link ${isActive('/weapon') ? 'active' : ''}`}>
            <i className="fas fa-tv"></i> Monitor
          </Link>
          <Link to="/location" className={`nav_link ${isActive('/location') ? 'active' : ''}`}>
            <i className="fas fa-map-marker-alt"></i> Maps
          </Link>

          <Link to="/tweet" className={`nav_link ${isActive('/tweet') ? 'active' : ''}`}>
          <i class="fa-solid fa-message"></i>Tweet Analysis
          </Link>
         
          <Link to="/cctvpage" className={`nav_link ${isActive('/cctvpage') ? 'active' : '' }` }>
          <i class="fa-solid fa-plus"></i>Register CCTV
          </Link>
          <Link to="/addpersonnel" className={`nav_link ${isActive('/addpersonnel') ? 'active' : '' }` }>
          <i class="fa-solid fa-plus"></i>Register Personnel
          </Link>

          <Link to="/mappersonnel" className={`nav_link ${isActive('/mappersonnel') ? 'active' : '' }` }>
          <i class="fa-solid fa-people-roof"></i>Manage Units
          </Link>

          <Link to="/checkpost" className={`nav_link ${isActive('/checkpost') ? 'active' : '' }` }>
          <i class="fa-solid fa-plus"></i> Register Checkpost
          </Link>
          

          <Link to="/patrolform" className={`nav_link ${isActive('/patrolform') ? 'active' : '' }` }>
          <i class="fa-solid fa-location-crosshairs"></i>Add Patrol
          </Link>
          <Link to="/patrol" className={`nav_link ${isActive('/patrol') ? 'active' : '' }` }>
          <i class="fa-solid fa-map"></i>Patrol Routes
          </Link>


          <Link to="/addInventory" className={`nav_link ${isActive('/addInventory') ? 'active' : '' }` }>
          <i class="fa-solid fa-plus"></i>Headquarter Invetory Dashboard
          </Link>


          <Link to="/PlaceOrder" className={`nav_link ${isActive('/PlaceOrder') ? 'active' : '' }` }>
          <i class="fa-solid fa-truck-fast"></i>Place Order
          </Link>

          

          <Link to="/Consumption" className={`nav_link ${isActive('/Consumption') ? 'active' : '' }` }>
          <i class="fa-solid fa-plus"></i> Checkpost Consumption
          </Link>
        </div>
        <div className="bottom">
          <button className="nav_link logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
