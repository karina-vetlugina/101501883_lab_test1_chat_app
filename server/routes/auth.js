const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// signup
router.post("/signup", async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    if (!username || !firstname || !lastname || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ username: username.trim() });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username.trim(),
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully!",
      user: {
        username: newUser.username,
        firstname: newUser.firstname,
        lastname: newUser.lastname
      }
    });
  } catch (err) {
    console.log("Signup error:", err);
    return res.status(500).json({ message: "Server error during signup." });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required." });
    }

    const user = await User.findOne({ username: username.trim() });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    return res.status(200).json({
      message: "Login successful!",
      user: {
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  } catch (err) {
    console.log("Login error:", err);
    return res.status(500).json({ message: "Server error during login." });
  }
});

// get all users (for private chat dropdown later)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ username: 1 });
    return res.status(200).json(users);
  } catch (err) {
    console.log("Users fetch error:", err);
    return res.status(500).json({ message: "Server error fetching users." });
  }
});

module.exports = router;