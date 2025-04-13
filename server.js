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

// ✅ Proper CORS setup to allow requests from your frontend (e.g., http://127.0.0.1:5500)
app.use(cors({
  origin: 'http://127.0.0.1:5500', // allow your HTML file served by Live Server
  methods: ['GET', 'POST'],
  credentials: false // set to true only if you're sending cookies/auth
}));

// 🔧 Middleware
app.use(bodyParser.json());

// 🌐 Serve static files (if needed)
app.use(express.static(path.join(__dirname)));

// 📦 API Routes
app.use("/api/auth", authRoutes);

// 🏠 Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🧠 Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
