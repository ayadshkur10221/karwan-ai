/**
 * Database Module
 * Manages SQLite database for server configurations
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/config.db');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
const db = new Database(dbPath);

console.log('✅ Connected to SQLite database');

/**
 * Initialize database tables
 */
const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS server_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guildId TEXT UNIQUE NOT NULL,
      channelId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    -- user_credits removed (credits system disabled)
  `);
};

// IMPORTANT: call AFTER function definition
initializeDatabase();

/**
 * Save or update channel configuration for a server
 * @param {string} guildId - Discord guild ID
 * @param {string} channelId - Discord channel ID
 * @returns {Promise} - Resolves when saved
 */
const saveChannelConfig = (guildId, channelId) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO server_config (guildId, channelId, updatedAt)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(guildId)
        DO UPDATE SET channelId = excluded.channelId, updatedAt = CURRENT_TIMESTAMP
      `);

      const result = stmt.run(guildId, channelId);
      resolve(result.lastInsertRowid);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Get channel configuration for a server
 */
const getChannelConfig = (guildId) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`SELECT channelId FROM server_config WHERE guildId = ?`);
      const row = stmt.get(guildId);
      resolve(row ? row.channelId : null);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Delete channel configuration for a server
 */
const deleteChannelConfig = (guildId) => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`DELETE FROM server_config WHERE guildId = ?`);
      stmt.run(guildId);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

/* credit-related functions removed */

module.exports = {
  db,
  saveChannelConfig,
  getChannelConfig,
  deleteChannelConfig,
  // credit functions removed
};