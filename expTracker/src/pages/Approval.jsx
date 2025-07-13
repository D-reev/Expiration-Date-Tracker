import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import { API_BASE } from "../apiConfig.js";
import axios from "axios";

function Approval({ currentUser }) {
  const [pendingProducts, setPendingProducts] = useState([]); // <-- Add this line
  const [resetRequests, setResetRequests] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [priceDialog, setPriceDialog] = useState({ open: false, prod: null, price: "" });

  useEffect(() => {
    fetchPendingProducts();
    fetchResetRequests();
    // eslint-disable-next-line
  }, []);

  async function fetchPendingProducts() {
    setLoadingProducts(true);
    try {
      const res = await axios.get(`${API_BASE}/pending-products`);
      setPendingProducts(res.data || []);
    } catch {
      setPendingProducts([]);
    }
    setLoadingProducts(false);
  }

  async function fetchResetRequests() {
    setLoadingRequests(true);
    try {
      const res = await axios.get(`${API_BASE}/password-reset-requests`);
      setResetRequests(res.data || []);
    } catch {
      setResetRequests([]);
    }
    setLoadingRequests(false);
  }

  // Product Approval
  const handleOpenPriceDialog = (prod) => setPriceDialog({ open: true, prod, price: "" });
  const handleClosePriceDialog = () => setPriceDialog({ open: false, prod: null, price: "" });

  async function handleApproveProduct() {
    if (!priceDialog.price || isNaN(priceDialog.price) || Number(priceDialog.price) <= 0) {
      alert("Enter a valid price.");
      return;
    }
    try {
      await axios.post(`${API_BASE}/approve-product/${priceDialog.prod.prodid}`, {
        price: Number(priceDialog.price)
      });
      fetchPendingProducts();
      handleClosePriceDialog();
    } catch (err) {
      alert("Failed to approve product.");
    }
  }

  // Password Reset Approval
  async function handleApproveRequest(id) {
    await axios.post(`${API_BASE}/password-reset-requests/${id}/approve`);
    fetchResetRequests();
  }

  async function handleRejectRequest(id) {
    await axios.post(`${API_BASE}/password-reset-requests/${id}/reject`);
    fetchResetRequests();
  }

  // Only admin can access
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="inventory-container">
        <Sidebar />
        <main className="content">
          <Typography variant="h4" color="error" style={{ marginTop: 40 }}>Access Denied: Admins Only</Typography>
        </main>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <Sidebar />
      <main className="content">
        {/* Pending Product Approvals */}
        <div className="inventory-header" style={{marginTop: 32, marginBottom: 8}}>
          <Typography variant="h5" className="inventory-title">Pending Product Approvals</Typography>
        </div>
        <TableContainer component={Paper} style={{marginBottom: 32}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
                <TableCell><strong>Unit</strong></TableCell>
                <TableCell><strong>Expiry Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingProducts ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading...</TableCell>
                </TableRow>
              ) : pendingProducts.length > 0 ? (
                pendingProducts.map(prod => (
                  <TableRow key={prod.prodid}>
                    <TableCell>{prod.prodname}</TableCell>
                    <TableCell>{prod.category}</TableCell>
                    <TableCell>{prod.quantity}</TableCell>
                    <TableCell>{prod.unit}</TableCell>
                    <TableCell>{prod.expiry_date}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleOpenPriceDialog(prod)}
                      >
                        Approve & Set Price
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">No pending products</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Price Dialog */}
        <Dialog open={priceDialog.open} onClose={handleClosePriceDialog}>
          <DialogTitle>Set Product Price</DialogTitle>
          <DialogContent>
            <Typography>Enter price for <b>{priceDialog.prod?.prodname}</b>:</Typography>
            <TextField
              label="Price"
              type="number"
              value={priceDialog.price}
              onChange={e => setPriceDialog(pd => ({ ...pd, price: e.target.value }))}
              fullWidth
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePriceDialog} color="secondary">Cancel</Button>
            <Button onClick={handleApproveProduct} variant="contained" color="primary">Approve</Button>
          </DialogActions>
        </Dialog>

        {/* Password Reset Requests */}
        <div className="inventory-header" style={{marginTop: 32, marginBottom: 8}}>
          <Typography variant="h5" className="inventory-title">Password Reset Requests</Typography>
        </div>
        <TableContainer component={Paper} style={{marginBottom: 32}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Requested At</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingRequests ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Loading...</TableCell>
                </TableRow>
              ) : resetRequests.length > 0 ? (
                resetRequests.map(req => (
                  <TableRow key={req._id}>
                    <TableCell>{req.email}</TableCell>
                    <TableCell>{req.role}</TableCell>
                    <TableCell>{new Date(req.requestedAt).toLocaleString()}</TableCell>
                    <TableCell>{req.status}</TableCell>
                    <TableCell>
                      {req.status === "pending" && (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            style={{marginRight: 8}}
                            onClick={() => handleApproveRequest(req._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleRejectRequest(req._id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">No password reset requests</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </main>
    </div>
  );
}

export default Approval;