const Sauce = require("../models/Sauce");
const fs = require("fs");

const regex = /^[a-zA-Z0-9 _.,!()&]+$/;
const regexLetter = /^[a-zA-Z _.,&]+$/;

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;

  if (
    !regexLetter.test(sauceObject.name) ||
    !regex.test(sauceObject.manufacturer) ||
    !regex.test(sauceObject.description) ||
    !regexLetter.test(sauceObject.mainPepper) ||
    !regex.test(sauceObject.heat)
  ) {
    return res.status(500).json({ message: "Un champ contient des caractères invalides !" });
  }

  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      console.log(sauces);
      res.status(200).json(sauces);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.likeOrDislike = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      switch (req.body.like) {
        case 1:
          if (!sauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }, _id: req.params.id })
              .then(() => res.status(210).json({ message: "La sauce a été Likée" }))
              .catch((error) => res.status(400).json({ error }));
          }
          break;

        case -1:
          if (!sauce.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }, _id: req.params.id })
              .then(() => res.status(210).json({ message: "La sauce a été Dislikée" }))
              .catch((error) => res.status(400).json({ error }));
          }
          break;

        case 0:
          if (sauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId }, _id: req.params.id })
              .then(() => res.status(201).json({ message: "Like Supprimé" }))
              .catch((error) => res.status(400).json({ error }));
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId }, _id: req.params.id })
              .then(() => res.status(201).json({ message: "Dislike Supprimé" }))
              .catch((error) => res.status(400).json({ error }));
          }
          break;
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
