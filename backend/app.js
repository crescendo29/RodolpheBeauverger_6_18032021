const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const mongoSanitize = require("express-mongo-sanitize"); //nettoie les data utilisateur pour prévenir l'injection d'opérateurs mongoDB
const helmet = require("helmet"); //Helmet aide à protéger l'application de certaines des vulnérabilités bien connues du Web en configurant de manière appropriée des en-têtes HTTP.
const hpp = require("hpp"); // middleware qui protège contre la pollution des paramètres HTTP

const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");

mongoose
  .connect("mongodb+srv://openclassrooms:formation@cluster0.kcmjs.mongodb.net/sopekocko?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.log(err));

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(mongoSanitize());

app.use(hpp());

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth/", userRoutes);
app.use("/api/sauces/", sauceRoutes);

module.exports = app;
