const mysql = require('mysql2');
require('dotenv').config();   // optional, but good practice

const pool = mysql.createPool({
  host: 'database-1.co3kus82asfr.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: '0pEaAr1PODRsddq2Ur0w',
  database: 'orderdb',        // make sure this exists
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();   // now db has .query(), .getConnection(), etc.
