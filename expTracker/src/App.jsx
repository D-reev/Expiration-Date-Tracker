import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Snackbar, Alert } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import ExpiredProducts from "./pages/ExpiredProducts";
import UserManagement from "./pages/UserManagement";
import AdminLogs from "./pages/AdminLogs";

const socket = io("http://localhost:1337");

function App() {
    const [notification, setNotification] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        socket.on("expiredProducts", (data) => {
            setNotification(data.message);
        });
        return () => {
            socket.off("expiredProducts");
        };
    }, []);

    return (
        <Router>
            <div>
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
        </Router>
    );
}

export default App;


