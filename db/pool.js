const { Pool } = require("pg");
require("dotenv").config();
// All of the following properties should be read from environment variables
// We're hardcoding them here for simplicity
module.exports = new Pool({
  // host: "localhost", // or wherever the db is hosted
  // user: "hamza723",
  // database: "members",
  // password: "6976",
  // port: 5432 // The default port
  connectionString: process.env.PROD_DB_URL,
  ssl: { rejectUnauthorized: false },
});