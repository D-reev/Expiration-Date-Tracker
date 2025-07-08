import React, { useRef, useEffect, useState } from 'react';
import './Inventory.css';
import {
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Autocomplete,
  Alert,
  Snackbar,
  CircularProgress,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import Sidebar from './Sidebar';
import axios from 'axios';
import categories from '../assets/categories.js';
import { useNavigate } from 'react-router-dom';

function Inventory() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModalAdd, setOpenModalAdd] = useState(false);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [openModalDelete, setOpenModalDelete] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Snackbar for notifications
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: '',
      severity: 'success'
    });

    const [editFormData, setEditFormData] = useState({
      prodid: "",
      prodname: "",
      category: "",
      quantity: "",
      unit: "",
      expiry_date: "",
      added_date: "",
      notification_sent: false
    });

    // Refs for add product form (from first code)
    const prodnameRef = useRef();
    const categoryRef = useRef();
    const quantityRef = useRef();
    const unitRef = useRef();
    const expiry_dateRef = useRef();
    const added_dateRef = useRef();

    const navigate = useNavigate();
    
    // Show notification
    const showMessage = (message, severity = 'success') => {
      setSnackbar({
        open: true,
        message,
        severity
      });
    };

    // Close notification
    const handleCloseSnackbar = () => {
      setSnackbar(prev => ({ ...prev, open: false }));
    };

    // Reset form (from first code)
    const resetForm = () => {
      [prodnameRef, categoryRef, quantityRef, unitRef, expiry_dateRef, added_dateRef].forEach(ref => {
        if (ref.current) ref.current.value = "";
      });
      setSelectedCategory(null);
    };

    // Close add modal
    const closeModalAdd = () => {
      setOpenModalAdd(false);
      resetForm();
    };

    // Close edit modal
    const closeModalEdit = () => {
      setOpenModalEdit(false);
      setSelectedProduct(null);
    };

    // Close delete modal
    const closeModalDelete = () => {
      setOpenModalDelete(false);
      setSelectedProduct(null);
    };

    // Fetch products
    useEffect(() => {
      fetchProducts();
    }, []);

    async function fetchProducts() {
      try {
        setLoading(true);
        console.log("Fetching products...");
        
        const response = await axios.get("http://localhost:1337/fetchproductsmongo");
        console.log("Fetch response:", response);
        
        if (response.data) {
          setProducts(Array.isArray(response.data) ? response.data : []);
          console.log("Products set:", response.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        showMessage("Error loading products. Check if backend is running.", "error");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    // Add product - using structure from first code
    async function handleAddProduct() {
      const newProduct = {
        prodname: prodnameRef.current.value,
        category: categoryRef.current.value,
        quantity: quantityRef.current.value,
        unit: unitRef.current.value,
        expiry_date: new Date(expiry_dateRef.current.value).toISOString().slice(0, 10),
        added_date: new Date(added_dateRef.current.value).toISOString().slice(0, 10),
        notification_sent: false,
      };
   
      try {
        if (!newProduct.prodname) {
          alert("Please enter a product name");
          return;
        }

        if (!newProduct.quantity) {
          alert("Please enter a quantity");
          return;
        }

        if (!newProduct.expiry_date) {
          alert("Please enter an expiry date");
          return;
        }

        if (!newProduct.added_date) {
          alert("Please enter an added date");
          return;
        }

        if (!newProduct.expiry_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          alert("Please enter a valid expiry date in YYYY-MM-DD format");
          return;
        }

        if (!newProduct.category) {
          alert("Please enter a category");
          return;
        }

        if (!newProduct.quantity.match(/^[0-9]+$/)) {
          alert("Please enter a valid quantity");
          return;
        }

        await axios.post("http://localhost:1337/addproductmongo", newProduct);
        fetchProducts();
        resetForm();
        setOpenModalAdd(false);
        showMessage("Product added successfully!", "success");
      } catch (error) {
        console.error("Error adding product:", error);
        showMessage("Error adding product", "error");
      }
    }

    // Delete product
    const handleOpenDeleteModal = (product) => {
      setSelectedProduct(product);
      setOpenModalDelete(true);
    };

    const handleDeleteProduct = async () => {
      if (!selectedProduct) return;

      try {
        setLoading(true);
        
        await axios.delete(`http://localhost:1337/deleteproductmongo/${selectedProduct.prodid}`);
        
        showMessage("Product deleted successfully!", "success");
        await fetchProducts();
        closeModalDelete();
      } catch (error) {
        console.error("Error deleting product:", error);
        showMessage("Error deleting product", "error");
      } finally {
        setLoading(false);
      }
    };

    // Edit product
    const handleOpenEditModal = (product) => {
      setSelectedProduct(product);
      setEditFormData({
        prodid: product.prodid,
        prodname: product.prodname,
        category: product.category || "",
        quantity: product.quantity.toString(),
        unit: product.unit || "",
        expiry_date: product.expiry_date || "",
        added_date: product.added_date || "",
        notification_sent: product.notification_sent || false
      });
      setOpenModalEdit(true);
    };

    const handleEditInputChange = (e) => {
      const { name, value } = e.target;
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleEditProduct = async () => {
      if (!editFormData.prodname.trim()) {
        showMessage("Product name is required", "error");
        return;
      }

      if (!editFormData.quantity || editFormData.quantity <= 0) {
        showMessage("Valid quantity is required", "error");
        return;
      }

      try {
        setLoading(true);
        
        const updatedProduct = {
          ...editFormData,
          quantity: Number(editFormData.quantity)
        };

        await axios.put(
          `http://localhost:1337/updateproductmongo/${selectedProduct.prodid}`,
          updatedProduct
        );

        showMessage("Product updated successfully!", "success");
        await fetchProducts();
        closeModalEdit();
      } catch (error) {
        console.error("Error updating product:", error);
        showMessage("Error updating product", "error");
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        <Sidebar />
        <div className="inventory-main-wrapper">
          {/* Header */}
          <div className="inventory-header">
            <Typography variant="h4" className="inventory-title">
              Inventory Management
            </Typography>
            <Button 
              variant="contained" 
              className="add-product-btn"
              onClick={() => {
                console.log("Add button clicked");
                setOpenModalAdd(true);
              }}
              startIcon={<AddIcon />}
              disabled={loading}
            >
              Add Product
            </Button>
          </div>

          {/* Loading */}
          {loading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          )}

          {/* Table */}
          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Date Added</th>
                  <th>Expiration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <tr key={product.prodid || index} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                      <td>{product.prodid || 'N/A'}</td>
                      <td className="product-name">{product.prodname || 'N/A'}</td>
                      <td>{product.category || 'N/A'}</td>
                      <td className="quantity">{product.quantity || 0}</td>
                      <td>{product.unit || 'N/A'}</td>
                      <td>{product.added_date || 'N/A'}</td>
                      <td>{product.expiry_date || 'N/A'}</td>
                      <td className="actions-cell">
                        <IconButton 
                          className="edit-btn" 
                          onClick={() => handleOpenEditModal(product)}
                          size="small"
                          disabled={loading}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          className="delete-btn" 
                          onClick={() => handleOpenDeleteModal(product)}
                          size="small"
                          disabled={loading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="no-products">
                      {loading ? "Loading products..." : "No products found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Product Modal - using structure from first code */}
          <Dialog 
            open={openModalAdd} 
            onClose={closeModalAdd} 
            maxWidth="sm" 
            fullWidth 
            className="inventory-dialog"
          >
            <DialogTitle className="dialog-title">Add New Product</DialogTitle>
            <DialogContent className="dialog-content">
              <TextField
                inputRef={prodnameRef}
                label="Product Name"
                variant="outlined"
                margin="normal"
                fullWidth
                required
                className="form-field"
                disabled={loading}
              />
              <Autocomplete
                disablePortal
                options={categories}
                fullWidth
                value={selectedCategory}
                onChange={(event, newValue) => setSelectedCategory(newValue)}
                className="form-field"
                disabled={loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    inputRef={categoryRef}
                    required
                    margin="normal"
                  />
                )}
              />
              <TextField
                inputRef={quantityRef}
                label="Quantity"
                variant="outlined"
                margin="normal"
                fullWidth
                required
                className="form-field"
                disabled={loading}
              />
              <TextField
                inputRef={unitRef}
                label="Unit"
                variant="outlined"
                helperText="e.g., kg, g, L, mL"
                margin="normal"
                fullWidth
                className="form-field"
                disabled={loading}
              />
              <TextField            
                inputRef={expiry_dateRef}
                label="Expiry Date"
                type="date"
                variant="outlined"
                margin="normal"
                fullWidth
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                InputLabelProps={{
                  shrink: true,
                }}
                className="form-field"
                disabled={loading}
              />
              <TextField
                inputRef={added_dateRef}
                label="Added Date"
                type="date"
                variant="outlined"
                margin="normal"
                fullWidth
                disabled
                defaultValue={new Date().toISOString().slice(0, 10)}
                InputLabelProps={{
                  shrink: true,
                }}
                className="form-field"
              />
            </DialogContent>
            <DialogActions className="dialog-actions">
              <Button 
                onClick={closeModalAdd} 
                variant="outlined" 
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddProduct}
                className="submit-btn"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Product"}
              </Button>
            </DialogActions>
          </Dialog>
           
          {/* Edit Product Modal */}
          <Dialog open={openModalEdit} onClose={closeModalEdit} maxWidth="sm" fullWidth className="inventory-dialog">
            <DialogTitle className="dialog-title">Edit Product</DialogTitle>
            <DialogContent className="dialog-content">
              <TextField 
                name="prodid" 
                label="Product ID" 
                variant="outlined" 
                margin="normal" 
                fullWidth 
                value={editFormData.prodid} 
                disabled 
                className="form-field"
              />
              <TextField 
                name="prodname" 
                label="Product Name" 
                variant="outlined" 
                margin="normal" 
                fullWidth 
                required
                value={editFormData.prodname} 
                onChange={handleEditInputChange} 
                className="form-field"
                disabled={loading}
              />
              <TextField 
                name="category" 
                label="Category" 
                variant="outlined" 
                margin="normal" 
                fullWidth 
                required
                value={editFormData.category} 
                onChange={handleEditInputChange} 
                className="form-field"
                disabled={loading}
              />
              <TextField 
                name="quantity" 
                label="Quantity" 
                variant="outlined" 
                margin="normal" 
                fullWidth 
                required
                type="number"
                value={editFormData.quantity} 
                onChange={handleEditInputChange}
                className="form-field"
                disabled={loading}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField 
                name="unit" 
                label="Unit" 
                variant="outlined" 
                margin="normal" 
                fullWidth 
                required
                value={editFormData.unit} 
                onChange={handleEditInputChange}
                className="form-field"
                disabled={loading}
              />
              <TextField
                name="expiry_date"
                label="Expiry Date"
                type="date"
                variant="outlined"
                margin="normal"
                fullWidth
                value={editFormData.expiry_date}
                onChange={handleEditInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                className="form-field"
                disabled={loading}
              />
            </DialogContent>
            <DialogActions className="dialog-actions">
              <Button 
                onClick={closeModalEdit} 
                variant="outlined" 
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleEditProduct} 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Product"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <Dialog open={openModalDelete} onClose={closeModalDelete} maxWidth="sm" fullWidth className="inventory-dialog">
            <DialogTitle className="dialog-title delete-title">Delete Confirmation</DialogTitle>
            <DialogContent className="dialog-content delete-content">
              <div className="delete-modal-flex">
                <DeleteIcon className="delete-modal-icon" />
                <div>
                  <Typography className="delete-modal-product">
                    Are you sure you want to delete the product{" "}
                    <strong style={{ color: "#b91c1c" }}>
                      {selectedProduct?.prodname}
                    </strong>
                    ?
                  </Typography>
                </div>
              </div>
            </DialogContent>
            <DialogActions className="dialog-actions">
              <Button 
                onClick={closeModalDelete} 
                variant="outlined" 
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                className="delete-confirm-btn" 
                onClick={handleDeleteProduct}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Notification */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </>
    );
}

export default Inventory;