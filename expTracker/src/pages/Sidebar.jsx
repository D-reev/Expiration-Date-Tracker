import React, { useState } from 'react'; 
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import AlarmOffIcon from '@mui/icons-material/AlarmOff';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';

function Sidebar() {
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate(); 
  const location = useLocation();

  const closeModal = () => setOpenModal(false);

  function handleLogout() {
    localStorage.removeItem("currentUser");
    closeModal();
    navigate("/login");
    window.location.reload();
  }

  const isInventory = location.pathname === "/inventory";
  const isExpired = location.pathname === "/expiredproducts";
  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className={`navbar${isDashboard ? " expanded" : ""}`}>
      {/* Remove Back to Dashboard button from sidebar for inventory */}
      {!isInventory && !isExpired && (
        <div className="head">
          <p className="headtext">Staff</p>
        </div>
      )}

      <div className="navbarlink" style={{ flex: 1 }}>
        {isDashboard && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <DashboardIcon className="icon" />
              <span className="nav-text">Dashboard</span>
            </NavLink>
            <div
              onClick={() => setOpenModal(true)}
              className="nav-item logout-bottom"
              style={{ marginTop: 0 }}
            >
              <LogoutIcon className="icon" />
              <span className="nav-text">Logout</span>
            </div>
          </>
        )}
      </div>

      {/* Bottom icons for inventory */}
      {isInventory && (
        <div className="sidebar-bottom-icons">
          <NavLink
            to="/expiredproducts"
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            <AlarmOffIcon className="icon" />
            <span className="nav-text">Expired Products</span>
          </NavLink>
          <div
            onClick={() => setOpenModal(true)}
            className="nav-item logout-bottom"
          >
            <LogoutIcon className="icon" />
            <span className="nav-text">Logout</span>
          </div>
        </div>
      )}

      {/* Bottom icons for expiredproducts */}
      {isExpired && (
        <div className="sidebar-bottom-icons">
          <NavLink
            to="/inventory"
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            <InventoryIcon className="icon" />
            <span className="nav-text">Inventory</span>
          </NavLink>
          <div
            onClick={() => setOpenModal(true)}
            className="nav-item logout-bottom"
          >
            <LogoutIcon className="icon" />
            <span className="nav-text">Logout</span>
          </div>
        </div>
      )}

      {/* Logout icon for other pages */}
      {!isInventory && !isExpired && !isDashboard && (
        <div
          onClick={() => setOpenModal(true)}
          className="nav-item logout-bottom"
        >
          <LogoutIcon className="icon" />
          <span className="nav-text">Logout</span>
        </div>
      )}
      
      <Dialog open={openModal} onClose={closeModal}>
        <div className='card'>
          <div className='icon'>
            <WarningIcon className='warning' />
          </div>
          <DialogTitle className='title'>Logout</DialogTitle>
          <DialogContent className='content'>
            <Typography className='message'>Are you sure you want to logout?</Typography>
          </DialogContent>
          <DialogActions className='actions'>
            <Button className='cancel' onClick={closeModal}>Cancel</Button>
            <Button className='logout' onClick={handleLogout}>Logout</Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
}

export default Sidebar;

<div className="inventory-container">
  <Sidebar />
  <div className="inventory-content">
  </div>
</div>