const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const pool = require("../db");

const userVerification = async (req, res, next) => {
  const bearer = req.get("Authorization");
  const token = bearer.split(" ")[1];

  try {
    const payload = jwt.verify(token, SECRET);
    // console.log(payload);
    const user = await pool.query(
      "SELECT * FROM teachers WHERE username = $1",
      [payload.username]
    );
    if (user === null) {
      res.status(401).send("No entry");
    } else {
      req.userDetail = payload.username;
      req.userid = payload.userid;
      next();
    }
  } catch (error) {
    // console.log(error);
    res.status(401).send({ msg: "Authentication error, please login again" });
  }
};

module.exports = userVerification;
