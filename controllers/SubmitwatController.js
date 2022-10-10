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
  // console.log(userid);
  const data = await pool.query(
    "SELECT * FROM teacher_class WHERE teacher_id = $1",
    [userid]
  );
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
    res.status(400).send(error);
  }
});

/* ------------------------ add class list ------------------------ */
router.post("/addclasslist", userVerification, async (req, res) => {
  // res.send("class list");
  const { array, newClass } = req.body;
  const teacher_id = req.userid;
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

router.post("/:id/addhw", userVerification, async (req, res) => {
  const hwInfo = req.body;
  const className = req.params;
  const teacher_id = req.userid;
  const date = hwInfo.date.split("-").join("");
  console.log(hwInfo.date.split("-").join(""));
  console.log(className);
  const hwColumnName = `${hwInfo.keyword}_${date}`;
  // res.status(200).send({ hwInfo, className });

  try {
    const addHwColumn = await pool.query(
      `ALTER TABLE class_${className.id}_homework_${teacher_id} ADD COLUMN ${hwColumnName} VARCHAR(50)`
    );
    res.status(200).send({ addHwColumn, hwColumnName });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.get("/:id/addhw/:name", userVerification, async (req, res) => {
  const { id } = req.params;
  const { name } = req.params;
  const teacher_id = req.userid;

  try {
    const hwTable = await pool.query(
      `SELECT student_id, student_name, ${name} FROM class_${id}_homework_${teacher_id}`
    );
    res.status(200).send(hwTable);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.put("/:id/addhw/:name", userVerification, async (req, res) => {
  // res.send("update table");
  const { id } = req.params;
  const { name } = req.params;
  const teacher_id = req.userid;

  const array = [];
  const details = req.body;
  console.log(id, name, teacher_id);
  console.log(details[0].status);
  try {
    for (let i = 0; i < details.length; i++) {
      console.log(i);
      const update = await pool.query(
        `UPDATE class_${id}_homework_${teacher_id} SET ${name}= $1 WHERE student_id = $2`,
        [details[i].status, i + 1]
      );
      array.push(update);
      // console.log(update);
    }
    res.send(array);
  } catch (error) {
    console.log(error);
    res.send({ msg: "error" });
  }
});

/* ------------------- get one homework details ------------------- */
router.get("/:id/:homeworkName", userVerification, async (req, res) => {
  const { id } = req.params;
  const { homeworkName } = req.params;
  const teacher_id = req.userid;
  console.log(homeworkName);
  console.log(id);

  // res.send(homeworkName);
  try {
    const homework = await pool.query(
      `SELECT student_id, student_name, ${homeworkName} FROM class_${id}_homework_${teacher_id}`
    );
    const submittedNum = await pool.query(
      `SELECT COUNT(*) AS SubmittedTotal FROM class_${id}_homework_${teacher_id} WHERE ${homeworkName}=$1`,
      ["submitted"]
    );
    const notSubmittedList = await pool.query(
      `SELECT student_name FROM class_${id}_homework_${teacher_id} WHERE ${homeworkName} NOT IN ($1)`,
      ["submitted"]
    );
    res.status(200).send({ homework, submittedNum, notSubmittedList });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
