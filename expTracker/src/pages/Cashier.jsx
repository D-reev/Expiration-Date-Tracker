import React, { useEffect, useState } from "react";
import "./Cashier.css";
import {
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Sidebar from "./Sidebar";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import categories from "../assets/categories";
import axios from "axios";
import { API_BASE } from "../apiConfig.js";

function Cashier() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    accountName: "",
    bankName: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await axios.get(`${API_BASE}/fetchproductsmongo`);
      setProducts(response.data);
    } catch (error) {
      setProducts([]);
    }
  }

  // Filter by category and search
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory
      ? prod.category === selectedCategory
      : true;
    const matchesSearch = prod.prodname
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.prodid === product.prodid);
      if (found) {
        if (found.qty < product.quantity) {
          return prev.map((item) =>
            item.prodid === product.prodid
              ? { ...item, qty: item.qty + 1 }
              : item
          );
        } else {
          return prev;
        }
      }
      return product.quantity > 0
        ? [...prev, { ...product, qty: 1 }]
        : prev;
    });
  };

  // Remove product from cart
  const removeFromCart = (prodid) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.prodid === prodid ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // Cart totals
  const subTotal = cart.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0) * item.qty,
    0
  );
  const tax = subTotal * 0.05;

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleBankInputChange = (e) => {
    setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
  };

  const handleProcessPayment = () => {
    // Add your payment logic here
    setOpenModal(false);
    // Optionally reset bank details
    setBankDetails({ accountNumber: "", accountName: "", bankName: "" });
  };

  return (
    <div className="inventory-container cashier-flex">
      <Sidebar />
      <main className="cashier-main">
        {/* Category Filter */}
        <Paper className="cashier-category-bar">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant={!selectedCategory ? "contained" : "outlined"}
              color="primary"
              onClick={() => setSelectedCategory(null)}
              sx={{ borderRadius: 3, fontWeight: 600 }}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.label ? "contained" : "outlined"}
                color="primary"
                onClick={() => setSelectedCategory(cat.label)}
                sx={{ borderRadius: 3, fontWeight: 600 }}
              >
                {cat.label}
              </Button>
            ))}
            <TextField
              placeholder="Search product..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ ml: "auto", background: "#fff", borderRadius: 2 }}
            />
          </Box>
        </Paper>

        {/* Product Grid */}
        <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 700, color: "#26415e" }}>
          Choose Order
        </Typography>
        <Box className="cashier-product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Paper key={product.prodid} className="cashier-product-card">
                <Box sx={{ mb: 1 }}>
                  {/* Placeholder image */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      background: "#f3f6fa",
                      borderRadius: "50%",
                      mx: "auto",
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 32,
                      color: "#bdbdbd",
                    }}
                  >
                    <span role="img" aria-label="product">
                      🛒
                    </span>
                  </Box>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#26415e" }}>
                  {product.prodname}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6c7a89" }}>
                  {product.category}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6c7a89" }}>
                  {product.unit} | Qty: {product.quantity}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6c7a89" }}>
                  Exp: {product.expiry_date}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#26415e", mt: 1 }}>
                  ₱{product.price ? Number(product.price).toFixed(2) : "0.00"}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 1, borderRadius: 3, fontWeight: 600 }}
                  onClick={() => addToCart(product)}
                  disabled={product.quantity <= 0 || !product.approved || product.price == null}
                >
                  {product.quantity > 0
                    ? (!product.approved || product.price == null
                        ? "Pending Approval"
                        : "Add to Cart")
                    : "Out of Stock"}
                </Button>
              </Paper>
            ))
          ) : (
            <Typography sx={{ color: "#bdbdbd", mt: 4 }}>No products found</Typography>
          )}
        </Box>
      </main>

      {/* Cart / Order Menu */}
      <aside className="cashier-cart">
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#26415e", mb: 2 }}>
          Order Menu
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {cart.length === 0 ? (
            <Typography sx={{ color: "#bdbdbd", textAlign: "center", mt: 4 }}>
              Cart is empty
            </Typography>
          ) : (
            cart.map((item) => (
              <Box key={item.prodid} className="cart-item">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      background: "#f3f6fa",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      color: "#bdbdbd",
                    }}
                  >
                    🛒
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#26415e" }}>
                      {item.prodname}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6c7a89" }}>
                      ₱{item.price ? Number(item.price).toFixed(2) : "0.00"} x {item.qty}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => removeFromCart(item.prodid)}>
                    <RemoveIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => addToCart(item)}>
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            ))
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>Sub Total</Typography>
            <Typography>₱{subTotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>Tax (5%)</Typography>
            <Typography>₱{tax.toFixed(2)}</Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ borderRadius: 3, fontWeight: 700, py: 1.5 }}
          disabled={cart.length === 0}
          onClick={handleOpenModal}
        >
          Cash Out
        </Button>
      </aside>

      {/* Bank Details Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Enter Bank Details for Payment</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Please provide your bank details. ₱{(subTotal + tax).toFixed(2)} will be deducted from your account.
          </Typography>
          <TextField
            label="Account Number*"
            name="accountNumber"
            value={bankDetails.accountNumber}
            onChange={handleBankInputChange}
            fullWidth
            margin="normal"
            placeholder="Enter your account number to auto-fill account name"
          />
          <TextField
            label="Account Name*"
            name="accountName"
            value={bankDetails.accountName}
            onChange={handleBankInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Bank Name*"
            name="bankName"
            value={bankDetails.bankName}
            onChange={handleBankInputChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleProcessPayment}
            variant="contained"
            color="primary"
            disabled={
              !bankDetails.accountNumber ||
              !bankDetails.accountName ||
              !bankDetails.bankName
            }
          >
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Cashier;