const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const userVerification = require("./Middleware");

const router = express.Router();
const SECRET = process.env.SECRET;

/* ------------------------ add class list ------------------------ */
router.post("/addclasslist", userVerification, async (req, res) => {
  // res.send("class list");
  const { array, newClass } = req.body;
  const teacher_id = req.userid;
  // res.send(newClass);
  console.log(array);

  //   const classArray = [];
  const classArrayHW = [];

  try {
    const createTable = await pool.query(
      `CREATE TABLE class_${newClass.keyword}_${teacher_id} (student_id INT PRIMARY KEY, student_name VARCHAR(50) NOT NULL, class_name VARCHAR(30))`
    );

    // const createHWTable = await pool.query(
    //   `CREATE TABLE class_${newClass.keyword}_homework_${teacher_id} (student_id SERIAL PRIMARY KEY, student_name VARCHAR(50) NOT NULL, class_name VARCHAR(30))`
    // );

    // for (const each of array) {
    //   const addClassList = pool.query(
    //     `INSERT INTO class_${newClass.keyword}_${teacher_id} (student_id, student_name, class_name) VALUES($1,$2, $3)`,
    //     [each.id, each.Name, newClass.keyword]
    //   );
    //   classArray.push(addClassList);
    // }

    for (const each of array) {
      const addClassList = pool.query(
        `INSERT INTO class_homework (teacher_id, student_id, student_name, class) VALUES($1,$2, $3, $4)`,
        [teacher_id, each.id, each.Name, newClass.keyword]
      );
      classArrayHW.push(addClassList);
    }

    const addHwTableToTeacher = await pool.query(
      `UPDATE teacher_class SET homework_table = $1 WHERE class_name =$2`,
      [`class_${newClass.keyword}_homework_${teacher_id}`, newClass.keyword]
    );
    res.status(200).send({
      createTable,

      classArrayHW,
      addHwTableToTeacher,
    });
  } catch (error) {
    res.status(400).send({ msg: "error", error });
  }
});

/* -------------------------- show all hw ------------------------- */
router.get("/:id/addhw/:homeworkName", userVerification, async (req, res) => {
  const { id } = req.params;
  const { homeworkName } = req.params;
  const teacher_id = req.userid;

  try {
    const hwTable = await pool.query(
      `SELECT student_id, student_name, ${homeworkName} FROM class_${id}_homework_${teacher_id} ORDER BY student_id `
    );
    res.status(200).send(hwTable);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

/* ------------------------- add hw column ------------------------ */
router.post("/:id/addhw", userVerification, async (req, res) => {
  const hwInfo = req.body;
  const className = req.params;
  const teacher_id = req.userid;
  const date = hwInfo.date.split("-").join("");
  console.log(hwInfo.date.split("-").join(""));
  console.log(className);
  const hwColumnName = `${hwInfo.assignmentName}_${date}`;
  // res.status(200).send({ hwInfo, className });

  try {
    const addHwColumn = await pool.query(
      `ALTER TABLE class_homework ADD COLUMN ${hwColumnName} VARCHAR(50)`
    );

    const createNotesTable = await pool.query(
      `CREATE TABLE class_${className.id}_${hwColumnName}_${teacher_id}_notes (note_id SERIAL PRIMARY KEY, notes TEXT NOT NULL, status BOOLEAN NOT NULL)`
    );

    res.status(200).send({ addHwColumn, hwColumnName, createNotesTable });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
