console.log("🛠️ Server starting...");

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const Redis = require("ioredis"); // ✅ ioredis
const connectRedis = require("connect-redis"); // ✅ use connect-redis

// Importing routes
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Create Redis client using ioredis
const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  // password: process.env.REDIS_PASSWORD, // Uncomment if needed
});

// Handling Redis connection errors
redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

// ✅ CORS configuration
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'https://janta-credit-web.onrender.com'], // Add more allowed origins if needed
  methods: ['GET', 'POST'],
  credentials: true
}));

// ✅ Middleware
app.use(bodyParser.json()); // Parsing JSON data
app.use(express.static(path.join(__dirname))); // Serve static files from the current directory

// ✅ Use Redis session store
const RedisStore = require("connect-redis")(session);
 // Initialize RedisStore with session

app.use(session({
  store: new RedisStore({ client: redisClient }), // Use RedisStore correctly
  secret: 'your-secret-key', // Use a secure secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true in production with HTTPS
    httpOnly: true, // Prevent client-side access to cookie
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// ✅ Routes
app.use("/api/auth", authRoutes); // Authentication routes

// Profile route - to get user session data
app.get("/api/profile", (req, res) => {
  if (!req.session.phone) {
    return res.status(400).json({ error: "No phone found in session. Please login again." });
  }
  res.json({ phone: req.session.phone });
});

// Home route to serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
