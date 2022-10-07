// to initiate
const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  host: "submitwat.cn3sssqsikj6.ap-southeast-1.rds.amazonaws.com",
  database: "postgres",
  password: "dAyagoh123",
  port: 5432,
});

console.log("hi");

module.exports = pool;
