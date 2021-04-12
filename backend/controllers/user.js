const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const maskData = require("maskdata");
const emailValidator = require("email-validator");
const passwordValidator = require("password-validator");

const emailMask2Options = {
  maskWith: "*",
  unmaskedStartCharactersBeforeAt: 2,
  unmaskedEndCharactersAfterAt: 2,
  maskAtTheRate: false,
};

var schema = new passwordValidator();

schema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(20) // Maximum length 20
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(1) // Must have at least 1 digits
  .has()
  .not()
  .spaces();

exports.signup = (req, res, next) => {
  if (emailValidator.validate(req.body.email) && schema.validate(req.body.password)) {
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: maskData.maskEmail2(req.body.email, emailMask2Options),
          password: hash,
        });
        user
          .save()
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  }
};

exports.login = (req, res, next) => {
  User.findOne({ email: maskData.maskEmail2(req.body.email, emailMask2Options) })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", { expiresIn: "24h" }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
