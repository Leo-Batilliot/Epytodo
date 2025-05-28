const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../../config/db');

// Register a new user
router.post('/register', async (req, res) => {
    const { email, name, firstname, password } = req.body;

    if (!email || !name || !firstname || !password) {
        return res.status(400).json({ msg: "Bad parameter" });
    }
    try {
        // existing email ?
        const [results] = await db.promise().query('SELECT * FROM user WHERE email = ?', [email]);
        if (results.length > 0) {
            return res.status(409).json({ msg: "Account already exists" });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const [insertResult] = await db.promise().query(
            'INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, firstname]
        );
        const [newUser] = await db.promise().query('SELECT id, email, name, firstname, created_at FROM user WHERE id = ?', [insertResult.insertId]);
        
        // Prints the token
        res.status(201).json({ 
            token: jwt.sign(
                { id: insertResult.insertId, email }, 
                process.env.SECRET, 
                { expiresIn: '1h' }
            )
        });
    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "Bad parameter" });
    }    
    try {
        // Check if the user exists
        const [results] = await db.promise().query('SELECT * FROM user WHERE email = ?', [email]);
        if (results.length === 0) {
            return res.status(400).json({ msg: "Bad parameter" });
        }

        const user = results[0];

        // Compare passwords and reject the login if its incorrect
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Invalid Credentials" });
        }

        // Create and return the token
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.SECRET, 
            { expiresIn: '1h' }
        );
        res.status(200).json({ token });
    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

module.exports = router;