console.log("🛠️ Server starting...");

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const Redis = require("ioredis"); // Required for Redis v8 store
const RedisStore = require("connect-redis").default; // Correct usage for connect-redis@8+

const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Create Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  // password: process.env.REDIS_PASSWORD, // Uncomment if needed
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

// ✅ CORS configuration
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'https://janta-credit-web.onrender.com'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// ✅ Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// ✅ Session with Redis
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'your-secret-key', // Use .env in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ Profile route
app.get("/api/profile", (req, res) => {
  if (!req.session.phone) {
    return res.status(400).json({ error: "No phone found in session. Please login again." });
  }

  const userPhone = req.session.phone;
  res.json({ phone: userPhone });
});

// ✅ Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
