const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'banana_game',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: 'local',
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');

    // Auto-migration: Ensure hints_used column exists in game_sessions
    try {
      await connection.query(
        `ALTER TABLE game_sessions ADD COLUMN hints_used TINYINT UNSIGNED DEFAULT 0 AFTER score_earned`
      );
      console.log('✅ Added hints_used column to game_sessions table');
    } catch (colErr) {
      // Column might already exist
    }

    // Auto-migration: Ensure time_taken_ms is signed INT to prevent unsigned out of range errors
    try {
      await connection.query(
        `ALTER TABLE game_sessions MODIFY COLUMN time_taken_ms INT NULL`
      );
    } catch (colErr) {
      // Ignore if table doesn't exist yet
    }

    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    throw error;
  }
};

module.exports = { pool, testConnection };
