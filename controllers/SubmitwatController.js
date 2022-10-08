const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const userVerification = require("./Middleware");

const router = express.Router();
const SECRET = process.env.SECRET;

/* -------------- display class in teacher's account ------------- */
router.get("/", userVerification, async (req, res) => {
  //   res.status(200).send("submitwat overivew");
  const userid = req.userid;
  console.log(userid);
  const data = await pool.query(
    "SELECT * FROM teacher_class WHERE teacher_id = $1",
    [userid]
  );
  // console.log(data);
  res.send(data);
});

/* --------------- add class to teacher_class table --------------- */
router.post("/addclass", userVerification, async (req, res) => {
  // res.send("add class");
  const classname = req.body;
  const userid = req.userid;
  // console.log(userid);
  try {
    const addClass = await pool.query(
      "INSERT INTO teacher_class (class_name, teacher_id) VALUES($1,$2)",
      [classname.keyword, userid]
    );
    res.status(200).send(addClass);
  } catch (error) {
    // console.log(error);
    res.status(400).send(error);
  }
});

/* ------------------------ add class list ------------------------ */
router.post("/addclasslist", userVerification, async (req, res) => {
  // res.send("class list");
  const { array, newClass } = req.body;
  const teacher_id = req.userid;
  console.log(array);
  console.log(teacher_id);
  // res.send(newClass);

  const classArray = [];
  const classArrayHW = [];

  try {
    const createTable = await pool.query(
      `CREATE TABLE class_${newClass.keyword}_${teacher_id} (student_id SERIAL PRIMARY KEY, student_name VARCHAR(50) NOT NULL, class_name VARCHAR(30))`
    );

    const createHWTable = await pool.query(
      `CREATE TABLE class_${newClass.keyword}_homework_${teacher_id} (student_id SERIAL PRIMARY KEY, student_name VARCHAR(50) NOT NULL, class_name VARCHAR(30))`
    );

    for (const each of array) {
      const addClassList = pool.query(
        `INSERT INTO class_${newClass.keyword}_${teacher_id} (student_name, class_name) VALUES($1,$2)`,
        [each.Name, newClass.keyword]
      );
      classArray.push(addClassList);
    }

    for (const each of array) {
      const addClassList = pool.query(
        `INSERT INTO class_${newClass.keyword}_homework_${teacher_id} (student_name, class_name) VALUES($1,$2)`,
        [each.Name, newClass.keyword]
      );
      classArrayHW.push(addClassList);
    }

    res
      .status(200)
      .send({ createTable, classArray, createHWTable, classArrayHW });
  } catch (error) {
    console.log(error);
    res.status(400).send({ msg: "error", error });
  }
});

/* ----------------- display class homework table ----------------- */
router.get("/:id", userVerification, async (req, res) => {
  const className = req.params;
  const teacher_id = req.userid;
  try {
    const classHwTable = await pool.query(
      `SELECT * FROM class_${className.id}_homework_${teacher_id}`
    );
    res.status(200).send(classHwTable);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

module.exports = router;

// try {
//   const createTable = await pool.query(
//     `CREATE TABLE class_${newClass} (student_id SERIAL PRIMARY KEY, student_name VARCHAR(50) NOT NULL, class_name VARCHAR(30) NOT NULL;`
//   );

// console.log(createTable);
// for (const each of array) {
//   const addClassList = pool.query(
//     `INSERT INTO class_${newClass} (student_name, class_name) VALUES($1,$2)`,
//     [each, newClass]
//   );
//   classArray.push(addClassList);
// }
// console.log(classArray);
// res.status(200).send({ createTable, classArray });
// res.send(createTable);
// } catch (error) {
//   console.log(error);
//   res.status(400).send(error);
// }
