const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const router = express.Router();

// POST SignUp
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, inviteCode } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "First name, last name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      inviteCode: inviteCode ? inviteCode : "",
    });

    await newUser.save();

    res.status(201).json({
      message: "Signup successful!",
      user: {
        id: newUser._id,
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        inviteCode: newUser.inviteCode,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = { userId: user._id, email: user.email };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: thirtyDays,
      })
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          token: token,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST LogOut
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during logout" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate JWT token valid for 1 hour
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Reset link for password reset
    const resetLink = `https://golf-app-backend-production.up.railway.app/api/auth/reset-password/${token}`;

    // ✅ Send email using Resend API instead of Gmail SMTP
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Golf App <onboarding@resend.dev>",
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <p>Hi ${user.name || ""},</p>
          <p>We received a request to reset your password.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" target="_blank">${resetLink}</a>
          <p>This link will expire in 1 hour.</p>
          <br/>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Email sending failed:", errorText);
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.status(200).json({ message: "Reset password link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
