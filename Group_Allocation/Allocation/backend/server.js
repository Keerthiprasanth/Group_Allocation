require("dotenv").config();

//Declaring express
const express = require("express");
const mongoose = require("mongoose");

const allocationRoutes = require("./routes/allocation");
const userRoutes = require("./routes/user");
const appSettingsRoutes = require("./routes/appSettings");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/api/allocation", allocationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/appSettings", appSettingsRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Connected to DB and Listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
