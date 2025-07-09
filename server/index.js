const express = require("express");
const cors = require("cors");
const User = require("./user.model");
const Product = require("./product.model");
const Log = require("./logs.model");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcrypt");
const request = require('./request.model');

require('dotenv').config(); // loads .env
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://dreev:Arvin132666708@cluster0.blxtffa.mongodb.net/")
  .then(() => console.log("✅ MongoDB (atlas) connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

const app = express();
app.use(cors());
app.use(express.json());

//tyest
const server = http.createServer(app); 
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST", "PUT", "DELETE"]
    },
});

const port = 5000;

function logProductData(action, product) {
    console.log(`${action} Product:`);
    Object.entries(product).forEach(([key, value]) => {
        if (key === "expiry_date" || key === "added_date") {
            const formattedDate = new Date(value).toISOString().slice(0, 10);
            console.log(`  ${key}: ${formattedDate}`);
        } else {
            console.log(`  ${key}: ${value}`);
        }
    });
    console.log();
}

app.get("/fetchproductsmongo", async (req, res) => {
    try {
      const products = await Product.find({});
      res.json(products);
    } catch (err) {
      console.error("Fetch error:", err);
      res.status(500).send("Internal server error");
    }
  });

app.post("/addproductmongo", async (req, res) => {
    try {
        // Find the last product and get the highest prodid
        const lastProduct = await Product.findOne().sort({ prodid: -1 }).exec();
        const nextProdId = lastProduct ? lastProduct.prodid + 1 : 1; // Increment prodid as a number

        const { prodname, category, quantity, unit, expiry_date, added_date, notification_sent } = req.body;

        const formattedExpiryDate = new Date(expiry_date).toISOString().slice(0, 10);
        const formattedAddedDate = new Date(added_date).toISOString().slice(0, 10);

        const newProduct = new Product({
            prodid: nextProdId, // Use the numeric prodid
            prodname,
            category,
            quantity,
            unit,
            expiry_date: formattedExpiryDate,
            added_date: formattedAddedDate,
            notification_sent,
        });
        //test
            await createLog(
            "add", 
            newProduct.prodid, 
            newProduct.prodname, 
            req.user?.email || "system" // or use req.user.name depending on your auth
            );


        await newProduct.save();

        logProductData("Added", newProduct);

        return res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ message: "Error adding product" });
    }
});

app.put("/updateproductmongo/:prodid", async (req, res) => {
    try {
        const { prodid } = req.params;
        const { prodname, category, quantity, expiry_date } = req.body;

        const updatedProduct = await Product.findOneAndUpdate(
            { prodid },
            { prodname, category, quantity, expiry_date }, 
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated successfully", student: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Error updating product" });
    }
});

app.delete("/deleteproductmongo/:prodid", async (req, res) => {
    try {
        const { prodid } = req.params;

        if (!prodid) {
            return res.status(400).json({ message: "Missing prodid parameter" });
        }

        const deletedProduct = await Product.findOneAndDelete({
            $or: [{ prodid: parseInt(prodid, 10) }, { prodid: prodid }],
        });

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (deletedProduct) {
      // Log the deletion
         await createLog(
        "delete",
        deletedProduct.prodid,
        deletedProduct.prodname,
        req.user?.email || "system"
        )};

        res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Error deleting product" });
    }
});

app.get("/fetchexpiredproducts", async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const expiredProducts = await Product.find({ expiry_date: { $lt: today } });
        res.json(expiredProducts);
    } catch (error) {
        console.error("Error fetching expired products:", error);
        res.status(500).json({ message: "Error fetching expired products" });
    }
});

app.post("/deleteexpiredproducts", async (req, res) => {
    const { ids } = req.body;
    try {
        await Product.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: "Crossed-out products deleted successfully" });
    } catch (error) {
        console.error("Error deleting crossed-out products:", error);
        res.status(500).json({ message: "Error deleting crossed-out products" });
    }
});

async function checkExpiredProducts() {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const expiredProducts = await Product.find({ expiry_date: { $lt: today }, notification_sent: false });

        if (expiredProducts.length > 0) {
            io.emit("expiredProducts", {
                message: `You have ${expiredProducts.length} expired products.`,
                products: expiredProducts,
            });

            await Product.updateMany(
                { expiry_date: { $lt: today }, notification_sent: false },
                { $set: { notification_sent: true } }
            );
        }
    } catch (error) {
        console.error("Error checking expired products:", error);
    } finally {
        setTimeout(checkExpiredProducts, 60000);
    }
}

checkExpiredProducts();

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

// Fetch all users
app.get("/users", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Add user
app.post("/users", async (req, res) => {
    try {
        const { userid, name, email, role } = req.body;
        const user = new User({ userid, name, email, role: role || "employee" });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update user
app.put("/users/:userid", async (req, res) => {
    try {
        const updated = await User.findOneAndUpdate(
            { userid: req.params.userid },
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete user
app.delete("/users/:userid", async (req, res) => {
    try {
        await User.findOneAndDelete({ userid: req.params.userid });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Signup endpoint
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const lastUser = await User.findOne().sort({ userid: -1 }).exec();
        const nextUserId = lastUser ? lastUser.userid + 1 : 1;
        const user = new User({
            userid: nextUserId,
            name,
            email,
            password: hashedPassword,
            role: role || "employee"
        });
        await user.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login endpoint
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid email or password" });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "Invalid email or password" });
        // For simplicity, return user info (do NOT send password)
        res.json({ userid: user.userid, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/logs", async (req, res) => {
  try {
    const { 
      action, 
      prodid, 
      user, 
      startDate, 
      endDate,
      sort = '-date', // Default: newest first
      limit = 50
    } = req.query;

    // Build query
    const query = {};
    if (action) query.action = action;
    if (prodid) query.prodid = prodid;
    if (user) query.user = { $regex: user, $options: 'i' };
    
    // Date range filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Execute query
    const logs = await Log.find(query)
      .sort(sort)
      .limit(parseInt(limit));

    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

app.delete("/logs/:id", async (req, res) => {
  try {
    // Basic admin check (you should implement proper auth middleware)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const deletedLog = await Log.findByIdAndDelete(req.params.id);
    if (!deletedLog) {
      return res.status(404).json({ error: "Log not found" });
    }

    res.json({ message: "Log deleted successfully" });
  } catch (err) {
    console.error("Error deleting log:", err);
    res.status(500).json({ error: "Failed to delete log" });
  }
});

// Enhanced log creation helper (to be used in other routes)
const createLog = async (action, prodid, prodname, user) => {
  try {
    await Log.create({ 
      action, 
      prodid, 
      prodname, 
      user,
      date: new Date()
    });
  } catch (err) {
    console.error("Error creating log:", err);
  }
};

app.get("/expiredproducts/count", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const count = await Product.countDocuments({ expiry_date: { $lt: today } });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit request
app.post("/forgot-password-request", async (req, res) => {
  const { email, role } = req.body;
  const user = await User.findOne({ email, role });
  if (!user) return res.status(404).json({ error: "Email not found for this role." });
  // Only one pending request per user
  const existing = await request.findOne({ email, status: "pending" });
  if (existing) return res.status(400).json({ error: "A pending request already exists." });
  const reqDoc = await request.create({ email, role });
  res.json({ message: "Request received", requestId: reqDoc._id });
});

// Get all requests (for admin)
app.get("/password-reset-requests", async (req, res) => {
  const requests = await request.find().sort({ requestedAt: -1 });
  res.json(requests);
});

// Approve request
app.post("/password-reset-requests/:id/approve", async (req, res) => {
  const reqDoc = await request.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
  res.json(reqDoc);
});

// Reject request
app.post("/password-reset-requests/:id/reject", async (req, res) => {
  const reqDoc = await request.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
  res.json(reqDoc);
});

// Check request status (for polling)
app.get("/password-reset-requests/:id/status", async (req, res) => {
  const reqDoc = await request.findById(req.params.id);
  res.json({ status: reqDoc?.status || "not_found" });
});

// Actually change password/email after approval
app.post("/reset-password", async (req, res) => {
  const { email, newPassword, newEmail } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (newEmail && newEmail !== email) {
    const exists = await User.findOne({ email: newEmail });
    if (exists) return res.status(400).json({ error: "New email already exists" });
    user.email = newEmail;
  }
  if (newPassword) {
    user.password = await bcrypt.hash(newPassword, 10);
  }
  await user.save();
  res.json({ message: "Password/email updated" });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
