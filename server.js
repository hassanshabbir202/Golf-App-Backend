const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db/connection");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Node.js server running successfully");
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is Running at port ${PORT}`);
});
