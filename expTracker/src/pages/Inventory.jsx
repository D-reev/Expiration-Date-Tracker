import React, { useRef, useEffect } from 'react';
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Sidebar from './Sidebar';
import { useState } from 'react';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import categories from '../assets/categories.js';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    
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
        const response = await axios.get("http://localhost:1337/fetchproductsmongo");
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

        await axios.post("http://localhost:1337/addproductmongo", newProduct);
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
  
      console.log("Deleting product with prodid:", selectedProduct.prodid);
  
      try {
          await axios.delete(`http://localhost:1337/deleteproductmongo/${selectedProduct.prodid}`);
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
          (`http://localhost:1337/updateproductmongo/${selectedProduct.prodid}`), 
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
      <div className="inventory-content">
        {/* Back to Dashboard Button */}
        <Button
          variant="outlined"
          className="back-dashboard-btn"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
        
        <div className="inventory-header">
          <Typography variant="h4" className="inventory-title">
            Inventory Management
          </Typography>
          <Button 
            variant="contained" 
            className="add-product-btn"
            onClick={() => setOpenModalAdd(true)}
            startIcon={<AddIcon />}
          >
            Add Product
          </Button>
        </div>

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
                  <tr key={product.prodid} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                    <td>{product.prodid}</td>
                    <td className="product-name">{product.prodname}</td>
                    <td>{product.category}</td>
                    <td className="quantity">{product.quantity}</td>
                    <td>{product.unit}</td>
                    <td>{product.added_date}</td>
                    <td>{product.expiry_date}</td>
                    <td className="actions-cell">
                      <IconButton 
                        className="edit-btn" 
                        onClick={() => handleOpenEditModal(product)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        className="delete-btn" 
                        onClick={() => handleOpenDeleteModal(product)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="no-products">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Product Modal */}
        <Dialog open={openModalAdd} onClose={() => setOpenModalAdd(false)} maxWidth="sm" fullWidth className="inventory-dialog">
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
            />
            <Autocomplete
              disablePortal
              options={categories}
              fullWidth
              value={selectedCategory}
              onChange={(event, newValue) => setSelectedCategory(newValue)}
              className="form-field"
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
            />
            <TextField 
              inputRef={unitRef} 
              label="Unit" 
              variant="outlined" 
              helperText="e.g., kg, g, L, mL"
              margin="normal" 
              fullWidth 
              className="form-field"
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
              onClick={() => setOpenModalAdd(false)} 
              variant="outlined" 
              className="cancel-btn"
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleAddProduct} 
              className="submit-btn"
            >
              Add Product
            </Button>
          </DialogActions>
        </Dialog>
         
        {/* Edit Product Modal */}
        <Dialog open={openModalEdit} onClose={() => setOpenModalEdit(false)} maxWidth="sm" fullWidth className="inventory-dialog">
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
              value={editFormData.prodname} 
              onChange={handleEditInputChange} 
              className="form-field"
            />
            <TextField 
              name="category" 
              label="Category" 
              variant="outlined" 
              margin="normal" 
              fullWidth 
              value={editFormData.category} 
              onChange={handleEditInputChange} 
              className="form-field"
            />
            <TextField 
              name="quantity" 
              label="Quantity" 
              variant="outlined" 
              margin="normal" 
              fullWidth 
              value={editFormData.quantity} 
              onChange={handleEditInputChange}
              className="form-field"
            />
            <TextField 
              name="unit" 
              label="Unit" 
              variant="outlined" 
              margin="normal" 
              fullWidth 
              value={editFormData.unit} 
              onChange={handleEditInputChange}
              className="form-field"
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
            />
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={() => setOpenModalEdit(false)} variant="outlined" className="cancel-btn">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleEditProduct} className="submit-btn">
              Update Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={openModalDelete} onClose={() => setOpenModalDelete(false)} maxWidth="sm" fullWidth className="inventory-dialog">
          <DialogTitle className="dialog-title delete-title">Delete Confirmation</DialogTitle>
          <DialogContent className="dialog-content">
            <Typography className="delete-message">
                Are you sure you want to delete the product <strong>{selectedProduct?.prodname}</strong>?
                <br />
                <span className="delete-warning">This action cannot be undone.</span>
            </Typography>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={() => setOpenModalDelete(false)} variant="outlined" className="cancel-btn">
              Cancel
            </Button>
            <Button variant="contained" className="delete-confirm-btn" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogActions>
        </Dialog> 
      </div>
    </div>
  );
}

export default Inventory;