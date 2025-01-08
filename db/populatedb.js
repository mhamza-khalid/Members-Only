#! /usr/bin/env node
require("dotenv").config();
const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_admin BOOLEAN NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_member BOOLEAN
);

CREATE TABLE IF NOT EXISTS messages (
    mess_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    message VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: process.env.PROD_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();