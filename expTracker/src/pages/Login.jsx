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
} from "@mui/material";
import axios from "axios";
import { API_BASE } from "../apiConfig.js";

function Login({ setCurrentUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupmodalOpen, setSignupModalOpen] = useState(false);
  const [signupRole, setSignupRole] = useState("employee"); 

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
      await axios.post(`${apiConfig}/signup`, newUser);
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

  const resetForm = () => {
    [nameRef, emailRef, passwordRef].forEach((ref) => {
      if (ref.current) ref.current.value = "";
    });
  };

  return (
    <div className="container">
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
            type="submit"
            variant="contained"
            className="form-button"
            style={{ marginTop: 16 }}
          >
            Signin
          </Button>
        </form>

        <div className="signup">
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

        <Dialog open={signupmodalOpen} onClose={signupmodalClose} maxWidth="sm" fullWidth>
          <form onSubmit={handleSignupBtn}>
            <DialogTitle>
              Signup as {signupRole.charAt(0).toUpperCase() + signupRole.slice(1)}
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
              <Button onClick={signupmodalClose} color="secondary" type="button">
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                Signup
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    </div>
  );
}

export default Login;