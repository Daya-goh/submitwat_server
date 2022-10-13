require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT ?? 4567;
const pool = require("./db");
const path = require("path");

const UserController = require("./controllers/UserController");
const MainController = require("./controllers/MainController");
const SubmitWatController = require("./controllers/SubmitwatController");
// const ModifiedSubmitWatController = require("./controllers/ModifiedSubmitWatController");

app.use(cors());
app.use(express.json());
/* -------------------- controllers middleware -------------------- */
app.use("/", UserController);
app.use("/main", MainController);
app.use("/submitwat", SubmitWatController);
// app.use("/modified/submitwat", ModifiedSubmitWatController);

/* ---------------------------------------------------------------- */
app.get("/", (req, res) => {
  res.status(200).send("SubmitWat");
});

// test pg connection - connected
app.get("/users", async (req, res) => {
  const user = await pool.query("SELECT * FROM teachers");
  res.status(200).send(user);
});

/* ---------------------------------------------------------------- */
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
