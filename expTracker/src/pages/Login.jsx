import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import axios from "axios";
import Eleben from "./img/eleben.png";
import { API_BASE } from "../apiConfig.js";

function Login({ setCurrentUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupmodalOpen, setSignupModalOpen] = useState(false);
  const [signupRole, setSignupRole] = useState("employee");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotRole, setForgotRole] = useState("employee");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotRequestId, setForgotRequestId] = useState(null);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [resetStep, setResetStep] = useState("request"); // "request", "waiting", "reset"
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // For signup
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  const signupmodalClose = () => setSignupModalOpen(false);

  async function handleLoginBtn(e) {
    if (e) e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email,
        password,
      });
      if (response.data && response.data.email) {
        setCurrentUser(response.data);
        localStorage.setItem("currentUser", JSON.stringify(response.data));
        // Redirect based on role
        if (response.data.role === "cashier") {
          navigate("/cashier");
        } else {
          navigate("/dashboard");
        }
      } else {
        alert(response.data.error || "Invalid email or password.");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("An error occurred during login. Please try again.");
      }
      console.error("Error during login:", error);
    }
  }

  async function handleSignupBtn(e) {
    if (e) e.preventDefault();
    const newUser = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      role: signupRole,
    };

    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("All fields are required.");
      return;
    }

    if (!newUser.email.endsWith("@gmail.com")) {
      alert("Email must end with @gmail.com");
      return;
    }

    if (!newUser.name.match(/^[a-zA-Z ]+$/)) {
      alert("Name can only contain letters and spaces.");
      return;
    }

    try {
      await axios.post(`${API_BASE}/signup`, newUser);
      alert("User successfully registered! You can now log in.");
      resetForm();
    } catch (error) {
      console.error("Error adding user:", error);
      alert(
        error.response?.data?.error ||
          "Failed to add user. Please try again."
      );
    } finally {
      setSignupModalOpen(false); // Always close modal after submit
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      // Check if email exists
      const res = await axios.post(`${API_BASE}/forgot-password-request`, {
        email: forgotEmail,
        role: forgotRole,
      });
      setForgotRequestId(res.data.requestId);
      setResetStep("waiting");
      setWaitingApproval(true);
      pollApproval(res.data.requestId);
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Failed to send request. Please try again."
      );
      setForgotOpen(false);
    }
    setForgotLoading(false);
  };

  const pollApproval = (requestId) => {
    let interval = setInterval(async () => {
      const res = await axios.get(
        `${API_BASE}/password-reset-requests/${requestId}/status`
      );
      if (res.data.status === "approved") {
        clearInterval(interval);
        setWaitingApproval(false);
        setResetStep("reset");
      } else if (
        res.data.status === "rejected" ||
        res.data.status === "not_found"
      ) {
        clearInterval(interval);
        setWaitingApproval(false);
        alert("Your request was rejected or not found.");
        setForgotOpen(false);
      }
    }, 3000);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      alert("Please enter a new password.");
      return;
    }
    try {
      await axios.post(`${API_BASE}/reset-password`, {
        email: forgotEmail,
        newPassword,
        newEmail: newEmail && newEmail !== forgotEmail ? newEmail : undefined,
      });
      alert("Password/email updated! You can now log in.");
      setForgotOpen(false);
      setResetStep("request");
      setForgotEmail("");
      setForgotRole("employee");
      setNewPassword("");
      setNewEmail("");
    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Failed to reset password/email. Please try again."
      );
    }
  };

  const resetForm = () => {
    [nameRef, emailRef, passwordRef].forEach((ref) => {
      if (ref.current) ref.current.value = "";
    });
  };

  return (
    <div className="login-root">
        <div className="login-left">
        <img
          src={Eleben}
          alt="Background"
          className="login-bg-img"
        />
      </div>
      <div className="form-container">
        <p className="title">Login</p>
        <form className="input-group" onSubmit={handleLoginBtn}>
          <TextField
            className="inputText"
            type="email"
            label="Email"
            variant="outlined"
            margin="normal"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            className="inputText"
            type="password"
            label="Password"
            variant="outlined"
            margin="normal"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="button"
            className="signup-button"
            style={{ float: "right", marginTop: 4, marginBottom: 8 }}
            onClick={() => setForgotOpen(true)}
          >
            Forgot Password?
          </Button>

          <Button
            type="submit"
            variant="contained"
            className="form-button"
            style={{ marginTop: 16 }}
          >
            Signin
          </Button>
        </form>

        <div className="signup-title">
          <h1>Sign Up as :</h1>
          <Button
            className="signup-button"
            variant="outlined"
            onClick={() => {
              setSignupRole("employee");
              setSignupModalOpen(true);
            }}
            type="button"
            sx={{ mr: 2 }}
          >
            Employee
          </Button>
          <Button
            className="signup-button"
            variant="outlined"
            onClick={() => {
              setSignupRole("cashier");
              setSignupModalOpen(true);
            }}
            type="button"
          >
            Cashier
          </Button>
        </div>

        <Dialog
          open={signupmodalOpen}
          onClose={signupmodalClose}
          maxWidth="sm"
          fullWidth
        >
          <form onSubmit={handleSignupBtn}>
            <DialogTitle>
              Signup as{" "}
              {signupRole.charAt(0).toUpperCase() + signupRole.slice(1)}
            </DialogTitle>
            <DialogContent>
              <TextField
                inputRef={nameRef}
                label="Name"
                variant="outlined"
                margin="normal"
                fullWidth
                required
              />
              <TextField
                inputRef={emailRef}
                label="Email"
                variant="outlined"
                margin="normal"
                fullWidth
                required
              />
              <TextField
                inputRef={passwordRef}
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                fullWidth
                required
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={signupmodalClose}
                color="secondary"
                type="button"
              >
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                Signup
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} maxWidth="xs" fullWidth>
          {resetStep === "request" && (
            <form onSubmit={handleForgotSubmit}>
              <DialogTitle>Forgot Password</DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Enter your email and role. An admin will be notified to approve your password reset request.
                </Typography>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                />
                <TextField
                  label="Role"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  select
                  SelectProps={{ native: true }}
                  value={forgotRole}
                  onChange={e => setForgotRole(e.target.value)}
                >
                  <option value="employee">Employee</option>
                  <option value="cashier">Cashier</option>
                </TextField>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setForgotOpen(false)} color="secondary" type="button">
                  Cancel
                </Button>
                <Button variant="contained" type="submit" disabled={forgotLoading}>
                  {forgotLoading ? "Sending..." : "Send Request"}
                </Button>
              </DialogActions>
            </form>
          )}
          {resetStep === "waiting" && (
            <DialogContent style={{ textAlign: "center", padding: "2rem" }}>
              <Typography variant="h6" gutterBottom>
                Waiting for admin approval...
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Please wait while an admin reviews your request.
              </Typography>
              <div className="modal-loading-spinner" style={{ margin: "2rem auto" }}>
                <span className="loader"></span>
              </div>
            </DialogContent>
          )}
          {resetStep === "reset" && (
            <form onSubmit={handleResetPassword}>
              <DialogTitle>Reset Password / Email</DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Your request was approved! Enter your new password and (optionally) a new Gmail address.
                </Typography>
                <TextField
                  label="New Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <TextField
                  label="New Gmail (optional)"
                  type="email"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setForgotOpen(false)} color="secondary" type="button">
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Change Password/Email
                </Button>
              </DialogActions>
            </form>
          )}
        </Dialog>
      </div>
    </div>
  );
}

export default Login;