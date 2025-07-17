import React, { use, useRef, useEffect } from 'react';
import './Inventory.css';
import {
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Sidebar from './Sidebar';
import { useState } from 'react';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import categories from '../assets/categories.js';
import { API_BASE } from "../apiConfig.js";
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

function Inventory() {

    const [products, setProducts] = useState([]);
    const [openModalAdd, setOpenModalAdd] = useState(false);
    const closeModalAdd = () => setOpenModalAdd(false);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const closeModalEdit = () => setOpenModalEdit(false);
    const [openModalDelete, setOpenModalDelete] = useState(false);
    const closeModalDelete = () => setOpenModalDelete(false);
    const [deleteProductId, setDeleteProductId] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [editFormData, setEditFormData] = useState({
      prodid: "",
      prodname: "",
      category: "",
      quantity: "",
      unit: "",
      expiry_date: "",
      added_date: new Date().toISOString().slice(0, 10),
      notification_sent: false
    });


    const prodidRef = useRef();
    const prodnameRef = useRef();
    const categoryRef = useRef();
    const quantityRef = useRef();
    const unitRef = useRef();
    const expiry_dateRef = useRef();
    const added_dateRef = useRef();
    const notification_sentRef = useRef();  
    
    const resetForm = () => {
      [prodidRef, prodnameRef, categoryRef, quantityRef, unitRef, expiry_dateRef, added_dateRef].forEach(ref => {
        if (ref.current) ref.current.value = "";
      });
       setSelectedCategory(null);
    };

    useEffect(() => {
      fetchProducts();
    }, []);

    async function fetchProducts() {
      try {
        const response = await axios.get(`${API_BASE}/fetchallproductsmongo`);
        if (response.status === 200) {
          setProducts(response.data); 
        } else {
          console.error("Failed to fetch products. Status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    }

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
        };


        if (!newProduct.quantity.match(/^[0-9]+$/)) {
          alert("Please enter a valid quantity");
          return;
        }


        await axios.post(`${API_BASE}/addproductmongo`, newProduct);
        fetchProducts(); 
        resetForm(); 
        setOpenModalAdd(false); 
      } catch (error) {
        console.error("Error adding product:", error);
      }
    }

    const handleOpenDeleteModal = (product) => {
      setSelectedProduct(product);
      setOpenModalDelete(true);
    };

    async function handleDeleteProduct() {
      if (!selectedProduct) {
          console.error("No product selected for deletion.");
          return;
      }
  
      console.log("Deleting product with prodid:", selectedProduct.prodid); // Debugging
  
      try {
          await axios.delete(`${API_BASE}/deleteproductmongo/${selectedProduct.prodid}`);

          fetchProducts();

          closeModalDelete();
      } catch (error) {
          console.error("Error deleting product:", error.message);
      }
  }
  
    const handleOpenEditModal = (product) => {
      setSelectedProduct(product);
      setEditFormData({
        prodid: product.prodid,
        prodname: product.prodname,
        category: product.category || "",
        quantity: product.quantity,
        unit: product.unit || "",
        expiry_date: product.expiry_date || "",
        added_date: product.added_date || ""
      });
      setOpenModalEdit(true);
    };
  
    const handleEditInputChange = (e) => {
      const { name, value } = e.target;
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    };
  
    async function handleEditProduct() {
      try {
        await axios.put(
          (`${API_BASE}/updateproductmongo/${selectedProduct.prodid}`), 
          editFormData
        );
        
        fetchProducts();
        closeModalEdit();
      } catch (error) {
        console.error("Error updating product:", error);
      }
    }
    
  return (
<div className="inventory-container">
      <Sidebar />
      <main className="content">
        
        <div className="board-container">
          <div className="board-header">
            <h2 className="board-title">
              <DashboardIcon /> Inventory Board
            </h2>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setOpenModalAdd(true)}
              className="add-product-btn"
            >
              Add Product
            </Button>
          </div>

          <div className="board-stats">
            <div className="stat-card">
              <div className="stat-title">
                <InventoryIcon sx={{ marginRight: 1 }} /> Total Products
              </div>
              <div className="stat-value">{products.length}</div>
              <div className="stat-subtitle">Items in inventory</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <TimelineIcon sx={{ marginRight: 1 }} /> Stocks
              </div>
              <div className="stat-value">
                {products.reduce((sum, product) => sum + Number(product.quantity), 0)}
              </div>
              <div className="stat-subtitle">Total quantity</div>
            </div>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Product ID</strong></TableCell>
                  <TableCell><strong>Product Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Quantity</strong></TableCell>
                  <TableCell><strong>Unit</strong></TableCell>
                  <TableCell><strong>Date Added</strong></TableCell>
                  <TableCell><strong>Expiration Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Price</strong></TableCell> {/* Add this */}
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.prodid}>
                      <TableCell>{product.prodid}</TableCell>
                      <TableCell>{product.prodname}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{product.expiry_date}</TableCell>
                      <TableCell>{product.added_date}</TableCell>
                      <TableCell>
                        {product.approved ? (
                          <span className="status-approved">Approved</span>
                        ) : (
                          <span className="status-pending">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.approved && product.price != null ? (
                          <span className="price-cell">₱{Number(product.price).toFixed(2)}</span>
                        ) : (
                          <span className="price-pending">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleOpenEditModal(product)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleOpenDeleteModal(product)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">No products found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={openModalAdd} onClose={() => setOpenModalAdd(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogContent>
              <TextField 
                inputRef={prodnameRef} 
                label="Product Name"
                variant="outlined" 
                margin="normal" 
                fullWidth 
                required 
              />
              <Autocomplete
                disablePortal
                options={categories}
                fullWidth
                value={selectedCategory}
                onChange={(event, newValue) => setSelectedCategory(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    inputRef={categoryRef}
                    required
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
              />
              <TextField 
                inputRef={unitRef} 
                label="Unit" 
                variant="outlined" 
                helperText="e.g., kg, g, L, mL"
                margin="normal" 
                fullWidth 
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
              />
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setOpenModalAdd(false)} 
                variant="contained" 
                color="error"
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddProduct} 
                color="primary"
              >
                Add Product
              </Button>
            </DialogActions>
          </Dialog>
           
          <Dialog open={openModalEdit} onClose={() => setOpenModalEdit(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogContent>
              <TextField 
                name="prodid" 
                label="Product ID" 
                variant="outlined" 
                margin="normal" 
                fullWidth 
                value={editFormData.prodid} 
                disabled 
              />
              <TextField 
                name="prodname" 
                label="Product Name" 
                variant="outlined" 
                margin="normal" 
                fullWidth 
                value={editFormData.prodname} 
                onChange={handleEditInputChange} 
              />
              <TextField 
                name="category" 
                label="Category" 
                variant="outlined" 
                margin="normal" 
                fullWidth 
                value={editFormData.category} 
                onChange={handleEditInputChange} 
              />
              <TextField 
                name="quantity" 
                label="Quantity" 
                variant="outlined" 
                margin="normal" 
                fullWidth 
                value={editFormData.quantity} 
                onChange={handleEditInputChange}
              />
              <TextField 
                name="unit" 
                label="Unit" 
                variant="outlined" 
                margin="normal" 
                fullWidth 
                value={editFormData.unit} 
                onChange={handleEditInputChange}
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
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenModalEdit(false)} variant="contained" color="error">
                Cancel
              </Button>
              <Button variant="contained" onClick={handleEditProduct} color="primary">
                Update Product
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openModalDelete} onClose={() => setOpenModalDelete(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Delete Confirmation</DialogTitle>
            <DialogContent>
              <Typography>
                  Are you sure you want to delete the product <strong>{selectedProduct?.prodname}</strong>?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenModalDelete(false)} variant="contained">
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={handleDeleteProduct}>
                Delete
              </Button>
            </DialogActions>
          </Dialog> 
        </div>
      </main>
    </div>
  );
}

export default Inventory