require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  };

  console.log(`🍌 Connecting to MySQL at ${config.host}:${config.port} as ${config.user}...`);

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL server.');

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📦 Executing schema.sql to initialize database & tables...');
    await connection.query(schemaSql);

    console.log('🎉 Database and tables initialized successfully!');
    console.log('🍌 You are ready to start the game server: npm run dev');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n👉 Please verify DB_PASSWORD in backend/.env matches your MySQL root password.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
