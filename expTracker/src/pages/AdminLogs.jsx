import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  InputAdornment,
  Box,
  CircularProgress
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import Sidebar from './Sidebar';
import './AdminLogs.css';

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:1337/logs");
      if (response.status === 200) {
        setLogs(response.data);
      } else {
        throw new Error("Failed to fetch logs");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setError("Failed to load logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenDeleteModal = (log) => {
    setSelectedLog(log);
    setOpenModalDelete(true);
  };

  const closeModalDelete = () => {
    setOpenModalDelete(false);
    setSelectedLog(null);
  };

  async function handleDeleteLog() {
    if (!selectedLog) return;

    try {
      await axios.delete(`http://localhost:1337/logs/${selectedLog._id}`);
      fetchLogs();
      closeModalDelete();
    } catch (error) {
      console.error("Error deleting log:", error);
      setError("Failed to delete log. Please try again.");
    }
  }

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.prodname.toLowerCase().includes(searchLower) ||
      log.user.toLowerCase().includes(searchLower) ||
      log.prodid.toString().includes(searchTerm)
    );
  });

  const getActionClass = (action) => {
    switch(action) {
      case 'add': return 'action-add';
      case 'delete': return 'action-delete';
      case 'update': return 'action-update';
      default: return '';
    }
  };

  return (
    <div className="admin-logs-container">
      <Sidebar />
      <main className="content">
        <Box className="logs-header">
          <Typography className="logs-title">Product Activity Logs</Typography>
          <Box className="search-container">
          </Box>
        </Box>

        {error && (
          <Box className="error-message">
            <Typography>{error}</Typography>
          </Box>
        )}

        {isLoading ? (
          <Box className="loading-message">
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Loading logs...</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell className={getActionClass(log.action)}>
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      </TableCell>
                      <TableCell>{log.prodid}</TableCell>
                      <TableCell>{log.prodname}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{new Date(log.date).toLocaleString()}</TableCell>
                      <TableCell>
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteModal(log)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="no-logs-message">
                      {searchTerm ? "No matching logs found" : "No logs available"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={openModalDelete} 
          onClose={closeModalDelete} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>Delete Log Confirmation</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this log entry for product <strong>{selectedLog?.prodname}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Action: {selectedLog?.action}<br />
              Date: {selectedLog?.date && new Date(selectedLog.date).toLocaleString()}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModalDelete}>Cancel</Button>
            <Button 
              onClick={handleDeleteLog}
              color="error"
              variant="contained"
            >
              Delete Log
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </div>
  );
}

export default AdminLogs;