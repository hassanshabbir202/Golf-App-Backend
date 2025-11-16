const express = require("express");
const GolfCourse = require("../models/GolfCourse");
const axios = require("axios");

const router = express.Router();

const FSQ_API_KEY = "1IHHD0XAE2VVWSXVZZ0WUVVTM1ONUON2E4IFE1CA0VEXJW0C";

router.get("/nearby", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ message: "Latitude and Longitude are required." });
    }

    const url = `https://places-api.foursquare.com/places/search?query=golf&ll=${lat},${lon}&radius=100000&limit=50`;
    const headers = {
      Authorization: `Bearer ${FSQ_API_KEY}`,
      "X-Places-Api-Version": "2025-06-17",
    };

    const response = await axios.get(url, { headers });

    const golfCourses = response.data.results.map((place) => ({
      name: place.name,
      country: place.location.country || "Unknown",
      latitude: place.geocodes?.main?.latitude || null,
      longitude: place.geocodes?.main?.longitude || null,
      image:
        place.categories?.[0]?.icon?.prefix &&
        place.categories?.[0]?.icon?.suffix
          ? `${place.categories[0].icon.prefix}256${place.categories[0].icon.suffix}`
          : "https://ss3.4sqi.net/img/categories_v2/golf/default_256.png",
    }));

    for (const course of golfCourses) {
      await GolfCourse.findOneAndUpdate(
        {
          name: course.name,
          latitude: course.latitude,
          longitude: course.longitude,
        },
        course,
        { upsert: true, new: true }
      );
    }

    res.json(golfCourses);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


module.exports = router;
