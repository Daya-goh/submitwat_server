const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();
const SECRET = process.env.SECRET;

// const { default: jwtDecode } = require("jwt-decode");

/* ---------------------------------------------------------------- */
// login route
router.post("/login", async (req, res) => {
  // get username and password from form
  const { username, password } = req.body;
  // console.log(username, password);
  try {
    // search for username in db
    const user = await pool.query(
      "SELECT username,password, teacher_id FROM teachers WHERE username = $1",
      [username]
    );
    // console.log(user);
    // if username does not exist
    if (user === null) {
      res.status(400).send({ msg: "No such user found." });
      // when username exist, check password - dehash using bcrypt
    } else if (bcrypt.compareSync(password, user.rows[0].password)) {
      // creating payload with username and teacher_id
      const username = user.rows[0].username;
      const userid = user.rows[0].teacher_id;
      const payload = { userid, username };
      // generate jwt token on successful login
      const token = jwt.sign(payload, SECRET, { expiresIn: "24h" });
      // console.log(jwt.verify(token, SECRET));
      // response to client - msg, token, username
      res.status(200).send({ msg: "Login successful.", token, username });
    }
  } catch (error) {
    // console.log(error);
    // console.log("im here");
    res.status(401).send({ msg: "Wrong username or password." });
  }
});

router.post("/signup", async (req, res) => {
  const userDetails = req.body;
  // encrypting user password with bcrypt
  userDetails.password = await bcrypt.hashSync(userDetails.password, 10);
  try {
    const newUser = await pool.query(
      "INSERT INTO teachers (username, password, email) VALUES ($1, $2, $3)",
      [userDetails.username, userDetails.password, userDetails.email]
    );
    res.status(200).send(newUser);
  } catch (error) {
    console.log(error);
    res.status(400).send({ msg: "Cannot create account." });
  }
});

module.exports = router;
