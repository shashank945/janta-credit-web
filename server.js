console.log("🛠️ Server starting...");

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const session = require("express-session"); // Import express-session

const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ CORS configuration (adjust origin for production deployment if needed)
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'https://janta-credit-web.onrender.com'], // For local dev; update with frontend URL on deployment
  methods: ['GET', 'POST'],
  credentials: true // Set credentials to true to allow session cookies
}));

// ✅ Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// ✅ Set up session middleware
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ Profile route to fetch user data from the session
app.get("/api/profile", (req, res) => {
  if (!req.session.phone) {
    return res.status(400).json({ error: "No phone found in session. Please login again." });
  }

  // You can fetch additional profile data from MongoDB using the phone number if needed
  const userPhone = req.session.phone; // Access the phone number from session
  res.json({ phone: userPhone });
});

// ✅ Serve home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Connect to MongoDB (non-blocking)
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Start server (Render fix: bind to 0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
