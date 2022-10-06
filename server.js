require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT ?? 4567;

app.use(express.json());
app.use(cors());

/* ---------------------------------------------------------------- */
app.get("/", (req, res) => {
  res.status(200).send("SubmitWat");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
