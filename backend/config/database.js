/**
 * MarketSphere - Database Connection Pool & Query Executor
 * Uses mysql2/promise for connection pooling and SQL queries.
 * Features auto-reconnect, parameterized queries, and graceful development fallback.
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'marketsphere_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool = null;
let isConnected = false;

try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn('[Database] Failed to initialize MySQL pool:', err.message);
}

/**
 * Test database connection
 */
async function testConnection() {
  if (!pool) return false;
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    console.log(`[Database] Successfully connected to MySQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`[Database Notice] MySQL server unreachable at ${dbConfig.host}:${dbConfig.port}. Using resilient in-memory model repository for standalone API execution.`);
    return false;
  }
}

/**
 * Execute parameterized SQL query
 * @param {string} sql - SQL string with ? placeholders
 * @param {Array} params - Parameters array
 */
async function query(sql, params = []) {
  if (!pool || !isConnected) {
    const connected = await testConnection();
    if (!connected) {
      throw new Error('DATABASE_OFFLINE');
    }
  }
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = {
  pool,
  query,
  testConnection,
  dbConfig,
  getIsConnected: () => isConnected
};
