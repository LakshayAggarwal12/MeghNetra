const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  const seedSql = fs.readFileSync(path.join(__dirname, "seed_reference.sql"), "utf-8");

  console.log("Applying schema.sql ...");
  await pool.query(schemaSql);

  console.log("Applying seed_reference.sql (categories, sources, admin user) ...");
  await pool.query(seedSql);

  console.log("Database setup complete.");
  await pool.end();
}

run().catch((err) => {
  console.error("DB setup failed:", err);
  process.exit(1);
});
