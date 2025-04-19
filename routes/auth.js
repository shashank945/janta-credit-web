const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// REGISTER route
router.post("/register", async (req, res) => {
  let { name, phone, password } = req.body;

  name = name.trim();
  phone = phone.trim();
  password = password.trim();

  console.log("📥 [REGISTER] Received:", { name, phone, password });

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      console.log("⚠️ [REGISTER] User already exists:", phone);
      return res.status(400).json({ error: "User already exists" });
    }

    // 👇 Don't hash here, Mongoose will handle it in the model
    const newUser = new User({ name, phone, password });
    await newUser.save();

    console.log("✅ [REGISTER] User registered:", phone);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ [REGISTER] Error:", err);
    res.status(400).json({ error: err.message });
  }
});

// LOGIN route
router.post("/login", async (req, res) => {
  let { phone, password } = req.body;

  phone = phone.trim();
  password = password.trim();

  console.log("🔐 [LOGIN] Attempt with phone:", phone);
  console.log("🔐 [LOGIN] Raw password entered:", password);

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      console.log("❌ [LOGIN] No user found for phone:", phone);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ [LOGIN] User found:", user.name);
    console.log("🧂 [LOGIN] Stored hashed password:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🟢 [LOGIN] Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    console.log("✅ [LOGIN] Login successful for:", user.name);

    // Store phone number in session after login
    req.session.phone = phone; // Save phone to session

    res.status(200).json({
      message: "Login successful",
      user: { name: user.name, phone: user.phone },
    });
  } catch (err) {
    console.error("❗ [LOGIN] Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PROFILE route (New)
router.get("/profile", async (req, res) => {
  const phone = req.session.phone;

  if (!phone) {
    return res.status(401).json({ error: "Please log in first" });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      name: user.name,
      phone: user.phone,
      age: user.age,
      address: user.address,
      creditScore: user.creditScore,
      fathersName: user.fathersName,
      dob: user.dob,
    });
  } catch (err) {
    console.error("❌ [PROFILE] Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
