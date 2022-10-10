// to initiate
const Pool = require("pg").Pool;

// host: "submitwat.cn3sssqsikj6.ap-southeast-1.rds.amazonaws.com",
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "submitwat",
  password: "dAyagoh123",
  port: 5432,
});

console.log("hi");

module.exports = pool;
