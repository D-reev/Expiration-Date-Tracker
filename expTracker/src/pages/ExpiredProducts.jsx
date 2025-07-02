import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import Sidebar from "./Sidebar";
import {
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
  Modal,
  Box,
  Button,
  Fab,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import "./ExpiredProducts.css";

const socket = io("http://localhost:1337");

function ExpiredProducts() {
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [notification, setNotification] = useState(null);
  const [crossedOut, setCrossedOut] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchExpiredProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:1337/fetchexpiredproducts"
      );
      setExpiredProducts(response.data);
    } catch (error) {
      console.error("Error fetching expired products:", error);
    }
  };

  useEffect(() => {
    fetchExpiredProducts(); // Only fetch expired products on mount
  }, []);

  useEffect(() => {
    socket.on("expiredProducts", (data) => {
      setNotification(data.message); // Set the notification message
      setExpiredProducts(data.products); // Update the expired products list
    });

    return () => {
      socket.off("expiredProducts");
    };
  }, []);

  const toggleCrossOut = (id) => {
    setCrossedOut((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteCrossedOut = async () => {
    const crossedOutIds = Object.keys(crossedOut).filter((id) => crossedOut[id]);
    try {
      await axios.post("http://localhost:1337/deleteexpiredproducts", {
        ids: crossedOutIds,
      });
      setExpiredProducts((prev) => prev.filter((product) => !crossedOut[product._id]));
      setCrossedOut({});
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting crossed-out products:", error);
    }
  };

  return (
    <div className="expProd-container">
      <Sidebar />
      <div className="expProd-main">
        {/* Back to Dashboard button at the very top */}
        <Button
          variant="outlined"
          className="back-dashboard-btn"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard")}
          style={{
            margin: "16px 0",
            background: "#dad7cd",
            color: "#3a5a40",
            fontWeight: 700,
            fontSize: "1.1rem",
            borderRadius: "10px",
            textTransform: "none",
            border: "1.5px solid #a3b18a",
            boxShadow: "none",
            letterSpacing: "0.5px",
            padding: "8px 28px",
          }}
        >
          BACK TO DASHBOARD
        </Button>
        {/* Heading below the button */}
        <h1>Expired Products</h1>
        {expiredProducts.length > 0 ? (
          <div className="expProd-grid">
            {expiredProducts.map((product) => (
              <Card
                key={product._id}
                className={`expProd-card ${
                  crossedOut[product._id] ? "crossed-out" : ""
                }`}
                onClick={() => toggleCrossOut(product._id)}
              >
                <CardContent>
                  <Typography variant="h5" component="div">
                    {product.prodname}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Expiry Date: {product.expiry_date}
                  </Typography>
                  <Typography variant="body2">
                    Quantity: {product.quantity}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Typography>No expired products found.</Typography>
        )}
      </div>

      {/* Snackbar for push notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000} // Notification disappears after 6 seconds
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Position at the top center
      >
        <Alert onClose={handleCloseNotification} severity="warning" sx={{ width: "100%" }}>
          {notification}
        </Alert>
      </Snackbar>

      {/* Sticky Delete Button */}
      <Fab
        color="secondary"
        aria-label="delete"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
        onClick={handleOpenDeleteModal}
      >
        <DeleteIcon />
      </Fab>

      {/* Confirmation Modal for Deleting Crossed-Out Products */}
      <Modal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        aria-labelledby="delete-confirmation-modal-title"
        aria-describedby="delete-confirmation-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="delete-confirmation-modal-title" variant="h6" component="h2">
            Confirm Deletion
          </Typography>
          <Typography id="delete-confirmation-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to delete the crossed-out products?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button variant="contained" color="error" onClick={handleDeleteCrossedOut}>
              Delete
            </Button>
            <Button variant="outlined" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default ExpiredProducts;