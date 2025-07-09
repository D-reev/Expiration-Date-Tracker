import React, { useState } from 'react'; 
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AlarmOffIcon from '@mui/icons-material/AlarmOff';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WarningIcon from '@mui/icons-material/Warning';
import ReorderIcon from '@mui/icons-material/Reorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function Sidebar() {
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate(); 

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const closeModal = () => setOpenModal(false);

  function handleLogout() {
    localStorage.removeItem("currentUser");
    closeModal();
    navigate("/login");
    window.location.reload();
  }

  // Only admin can access user management
  function handleUserManagement() {
    navigate("/usermanagement");
  }

  return (
    <div className="navbar">
      <div className="head">
        <p className="headtext">EXPTracker</p>
      </div>

      <div className="navbarlink">
        {currentUser && currentUser.role === "cashier" ? (
          <>
            <NavLink
              to="/cashier"
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <ShoppingCartIcon className="icon" />
              Cashier
            </NavLink>
            <div
              onClick={() => setOpenModal(true)}
              className="nav-item logout-bottom"
            >
              <LogoutIcon className="icon" />
              Logout
            </div>
          </>
        ) : (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <DashboardIcon className="icon" />
              Dashboard
            </NavLink>

            <NavLink
              to="/inventory"
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <InventoryIcon className="icon" />
              Inventory
            </NavLink>

            <NavLink
              to="/cashier"
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              style={{
                display:
                  currentUser &&
                  (currentUser.role === "cashier" || currentUser.role === "admin")
                    ? "flex"
                    : "none"
              }}
            >
              <ShoppingCartIcon className="icon" />
              Cashier
            </NavLink>

            <NavLink
              to="/expiredproducts"
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <AlarmOffIcon className="icon" />
              Expired Products
            </NavLink>
            
            {currentUser && currentUser.role === "admin" && (
              <NavLink
                to="/usermanagement"
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                <PersonAddIcon className='icon'/>
                User Management
              </NavLink>
            )}

            {currentUser && currentUser.role === "admin" && (
              <NavLink
                to="/adminlogs"
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                <ReorderIcon className='icon'/>
                Logs
              </NavLink>
            )}

            <div
              onClick={() => setOpenModal(true)}
              className="nav-item logout-bottom"
            >
              <LogoutIcon className="icon" />
              Logout
            </div>
          </>
        )}
      </div>
      
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