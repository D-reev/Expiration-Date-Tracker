import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import ExpiredProducts from "./pages/ExpiredProducts";
import UserManagement from "./pages/UserManagement";
import AdminLogs from "./pages/AdminLogs";
import axios from "axios";

const socket = io("http://localhost:1337");

function App() {
    const [notification, setNotification] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [expiredModalOpen, setExpiredModalOpen] = useState(false);
    const [expiredCount, setExpiredCount] = useState(0);

    useEffect(() => {
        socket.on("expiredProducts", (data) => {
            setNotification(data.message);
        });
        return () => {
            socket.off("expiredProducts");
        };
    }, []);

    // Fetch expired products count when logged in
    useEffect(() => {
        if (currentUser) {
            async function fetchExpiredCount() {
                try {
                    const response = await axios.get("http://localhost:1337/expiredproducts/count");
                    setExpiredCount(response.data.count || 0);
                    if (response.data.count > 0) {
                        setExpiredModalOpen(true);
                    }
                } catch (error) {
                    console.error("Error fetching expired products count:", error);
                }
            }
            fetchExpiredCount();
        }
    }, [currentUser]);

    return (
        <HashRouter>
            <div>
                {/* Snackbar for notifications */}
                <Snackbar
                    open={!!notification}
                    autoHideDuration={6000}
                    onClose={() => setNotification(null)}
                >
                    <Alert
                        onClose={() => setNotification(null)}
                        severity="warning"
                        sx={{ width: "100%" }}
                    >
                        {notification}
                    </Alert>
                </Snackbar>

                {/* Modal for expired products */}
                <Dialog open={expiredModalOpen} onClose={() => setExpiredModalOpen(false)}>
                    <DialogTitle className="dialog-title">Expired Products</DialogTitle>
                    <DialogContent className="dialog-content">
                        <p>There are {expiredCount} expired products in the inventory.</p>
                    </DialogContent>
                    <DialogActions className="dialog-actions">
                        <Button
                            onClick={() => setExpiredModalOpen(false)}
                            className="dialog-button-close"
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Routes */}
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
                    <Route path="/dashboard" element={currentUser ? <Dashboard currentUser={currentUser} /> : <Navigate to="/login" />} />
                    <Route path="/inventory" element={currentUser ? <Inventory currentUser={currentUser} /> : <Navigate to="/login" />} />
                    <Route path="/expiredproducts" element={currentUser ? <ExpiredProducts currentUser={currentUser} /> : <Navigate to="/login" />} />
                    <Route path="/usermanagement" element={currentUser ? <UserManagement currentUser={currentUser} /> : <Navigate to="/login" />} />
                    <Route path="/adminlogs" element={currentUser ? <AdminLogs currentUser={currentUser} /> : <Navigate to="/login" />} />
                    <Route path="*" element={<h1>404 - Page Not Found</h1>} />
                </Routes>
            </div>
        </HashRouter>
    );
}

export default App;


