const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcrypt");
const { validateToken } = require("../middleware/AuthMiddleware");

const { sign } = require("jsonwebtoken");

// router.get("/", async (req, res) => {
//   const listOfPosts = await Posts.findAll();
//   res.json(listOfPosts);
// });

router.post("/", async (req, res) => {
  const { email, fullName, username, password } = req.body;
  const user_name = await Users.findOne({ where: { username: username } });
  const user_mail = await Users.findOne({ where: { email: email } });
  if (user_mail) {
    res.json({ status: 1 });
  } else if (user_name) {
    res.json({ status: 2 });
  } else {
    bcrypt.hash(password, 10).then((hash) => {
      Users.create({
        email: email,
        fullName: fullName,
        username: username,
        password: hash,
      });
      res.json({ status: 3 });
    });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findOne({ where: { username: username } });
  if (!user) res.json({ status: 1 });

  bcrypt.compare(password, user.password).then((match) => {
    if (!match) res.json({ status: 2 });

    const accessToken = sign(
      { username: user.username, id: user.id },
      "uygUy542uGDS5sf546bFU"
    );
    res.json({
      status: 3,
      accessToken: accessToken,
      username: user.username,
      id: user.id,
    });
  });
});

router.get("/details/:id", async (req, res) => {
  console.log(req.params.id);
  const user = await Users.findOne({ where: { id: req.params.id } });

  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    profile_image: user.profile_image,
  });
});

router.get("/auth", validateToken, (req, res) => {
  res.json(req.user);
});

module.exports = router;
