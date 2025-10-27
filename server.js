const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db/connection");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT;

app.use("/", () => {
  res.send("This is the express server");
});

app.listen(PORT, () => {
  console.log(`Server is Running at port ${PORT}`);
});
