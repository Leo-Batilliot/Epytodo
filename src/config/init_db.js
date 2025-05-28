const db = require('./db');

async function initializeDatabase() {
    // creates the tables if they don't exist
    try {
        await db.promise().query(`
        CREATE TABLE IF NOT EXISTS user (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            firstname VARCHAR(100) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `);
        await db.promise().query(`
        CREATE TABLE IF NOT EXISTS todo (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            due_time DATETIME NOT NULL,
            status ENUM('not started', 'todo', 'in progress', 'done') DEFAULT 'not started',
            user_id INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
        )
        `);
    } catch (error) {
        throw error;
    }
}

module.exports = { initializeDatabase };