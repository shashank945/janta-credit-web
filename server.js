console.log("🛠️ Server starting...");

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ CORS configuration (adjust origin for production deployment if needed)
app.use(cors({
  origin: 'http://127.0.0.1:5500', // For local dev; update with frontend URL on deployment
  methods: ['GET', 'POST'],
  credentials: false
}));

// ✅ Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ Serve home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Connect to MongoDB (non-blocking)
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Start server (needed for Render to detect open port)
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
