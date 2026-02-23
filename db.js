const mysql = require('mysql2');
const pool = mysql.createPool({
  host: 'database-1.co3kus82asfr.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: '0pEaAr1PODRsddq2Ur0w',
  database: 'orderdb',   // make sure this database exists
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = {
  pool: pool.promise(),   // so you can use async/await with db.pool.query
  connect: () => console.log('Order Service DB connected')
};
