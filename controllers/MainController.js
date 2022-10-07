const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();
const SECRET = process.env.SECRET;

const userVerification = require("./Middleware");

router.get("/", userVerification, async (req, res) => {
  //   res.send({ msg: "main" });
  const username = req.userDetail;
  try {
    const user = await pool.query(
      "SELECT teacher_id, username, password FROM teachers WHERE username=$1",
      [username]
    );
    // console.log(user);
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send({ msg: "Cannot get user." });
  }
});

module.exports = router;
