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
import "./ExpiredProducts.css";

const socket = io("http://localhost:1337");

function ExpiredProducts() {
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [notification, setNotification] = useState(null);
  const [crossedOut, setCrossedOut] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function fetchExpiredProducts() {
      try {
        const res = await axios.get("http://localhost:1337/fetchproductsmongo");
        const today = new Date().toISOString().slice(0, 10);

        const expired = res.data.filter(
          (product) => product.expiry_date && product.expiry_date <= today
        );

        setExpiredProducts(expired);
      } catch (error) {
        console.error("Error fetching expired products:", error);
      }
    }

    fetchExpiredProducts();
  }, []);

  useEffect(() => {
    socket.on("expiredProducts", (data) => {
      setNotification(data.message);
      setExpiredProducts(data.products);
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
      setExpiredProducts((prev) =>
        prev.filter((product) => !crossedOut[product._id])
      );
      setCrossedOut({});
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting crossed-out products:", error);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="expProd-container">
        <div className="expProd-main">
          {/* Page Header */}
          <div className="expProd-header">
            <h1>Expired Products Management</h1>
            <p className="expProd-subtitle">
              Monitor and manage products that have reached their expiration date
            </p>
          </div>

          {/* Products Grid */}
          {expiredProducts.length > 0 ? (
            <div className="expProd-grid">
              {expiredProducts.map((product) => (
                <Card
                  key={product._id}
                  className={`expProd-card ${crossedOut[product._id] ? "crossed-out" : ""}`}
                  onClick={() => toggleCrossOut(product._id)}
                >
                  <CardContent className="expProd-card-content">
                    <div className="expProd-card-header">
                      <Typography variant="h6" component="div" className="product-name">
                        {product.prodname}
                      </Typography>
                      <div className="expiry-badge">EXPIRED</div>
                    </div>
                    <div className="expProd-card-details">
                      <div className="detail-item">
                        <span className="detail-label">Expiry Date:</span>
                        <span className="detail-value">{product.expiry_date}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Quantity:</span>
                        <span className="detail-value">{product.quantity}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Category:</span>
                        <span className="detail-value">{product.category}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="no-products-message">
              <Typography variant="h6" className="no-products-text">
                No expired products found
              </Typography>
              <Typography variant="body2" className="no-products-subtitle">
                All products are within their expiration dates
              </Typography>
            </div>
          )}
        </div>
      </div>

      {/* Snackbar Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseNotification} severity="warning" sx={{ width: "100%" }}>
          {notification}
        </Alert>
      </Snackbar>

      {/* Delete FAB */}
      <Fab
        color="secondary"
        aria-label="delete"
        className="delete-fab"
        onClick={handleOpenDeleteModal}
      >
        <DeleteIcon />
      </Fab>

      {/* Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        aria-labelledby="delete-confirmation-modal-title"
        aria-describedby="delete-confirmation-modal-description"
      >
        <Box className="delete-modal">
          <Typography id="delete-confirmation-modal-title" variant="h6" component="h2" className="modal-title">
            Confirm Deletion
          </Typography>
          <Typography id="delete-confirmation-modal-description" className="modal-description">
            Are you sure you want to permanently delete the selected expired products? This action cannot be undone.
          </Typography>
          <Box className="modal-actions">
            <Button variant="contained" className="delete-btn" onClick={handleDeleteCrossedOut}>
              Delete Products
            </Button>
            <Button variant="outlined" className="cancel-btn" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default ExpiredProducts;
