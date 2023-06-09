const sql = require("mssql");
require("dotenv").config();

const settings = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  server: process.env.SERVER,
  database: process.env.DATABASE,

  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const getConnection = async () => {
  try {
    const pool = sql.connect(settings);

    return pool;
  } catch (error) {
    console.log(error);
  }
};

module.exports= {
  getConnection,
  sql
}
