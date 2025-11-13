const express = require("express");
const User = require("../models/User");

const router = express.Router();

// GET Profile
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});

// PUT Profile 
router.put("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      phoneNumber,
      profileImage,
      handicap,
      avgScore,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (profileImage) user.profileImage = profileImage;
    if (handicap !== undefined) user.handicap = handicap;
    if (avgScore !== undefined) user.avgScore = avgScore;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        handicap: user.handicap,
        avgScore: user.avgScore,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

module.exports = router;
