const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");

mongoose
  .connect("mongodb+srv://openclassrooms:formation@cluster0.kcmjs.mongodb.net/sopekocko?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.log(err));

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth/", userRoutes);
app.use("/api/sauces/", sauceRoutes);

module.exports = app;
