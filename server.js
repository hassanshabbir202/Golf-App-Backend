const express = require("express");
const app = express();

app.use("/", (req, res) => {
  res.send("This is the express server");
});

app.listen(5000, () => {
  console.log("Server is Running");
});
