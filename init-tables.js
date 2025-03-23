// init-tables.js
const { pool } = require("./db");

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        facilitator TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS rounds (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        round_id INTEGER REFERENCES rounds(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        value TEXT NOT NULL
      );
    `);

    console.log("✅ Tables created successfully.");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    await pool.end(); // close connection
  }
};

createTables();
