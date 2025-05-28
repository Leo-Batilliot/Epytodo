const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');

// format the date (remove characters) for printing
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Get all users
router.get('/users', auth, async (req, res) => {
    try {
        const [users] = await db.promise().query(
            'SELECT id, email, name, firstname, password, created_at FROM user'
        );

        // format users for the print
        const formattedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            password: user.password,
            created_at: formatDate(user.created_at),
            firstname: user.firstname,
            name: user.name
        }));
        res.status(200).json(formattedUsers);

    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Get user by ID or email
router.get('/users/:identifier', auth, async (req, res) => {
    const { identifier } = req.params;
    
    try {
        // prepare a request and check if the given identifier is the mail or ID
        let query = 'SELECT id, email, name, firstname, password, created_at FROM user WHERE ';
        if (isNaN(identifier)) {
            query += 'email = ?';
        } else {
            query += 'id = ?';
        }
        const [user] = await db.promise().query(query, [identifier]);
        if (user.length === 0) {
            return res.status(404).json({ msg: "Not found" });
        }

        const userData = user[0];
        // format for the print
        res.status(200).json({
            id: userData.id,
            email: userData.email,
            password: userData.password,
            created_at: formatDate(userData.created_at),
            firstname: userData.firstname,
            name: userData.name
        });
    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Get current user information
router.get('/user', auth, async (req, res) => {
    try {
        const [user] = await db.promise().query(
            'SELECT id, email, password, created_at, firstname, name FROM user WHERE id = ?',
            [req.user.id]
        );
        if (user.length === 0) {
            return res.status(404).json({ msg: "Not found" });
        }
        
        const userData = user[0];
        // format for the print
        res.status(200).json({
            id: userData.id,
            email: userData.email,
            password: userData.password,
            created_at: formatDate(userData.created_at),
            firstname: userData.firstname,
            name: userData.name
        });

    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Get todos for current user
router.get('/user/todos', auth, async (req, res) => {
    try {
        const [todos] = await db.promise().query(
            'SELECT * FROM todo WHERE user_id = ?',
            [req.user.id]
        );
        
        // format todos for the print
        const formattedTodos = todos.map(todo => ({
            id: todo.id,
            title: todo.title,
            description: todo.description,
            created_at: formatDate(todo.created_at),
            due_time: formatDate(todo.due_time),
            user_id: todo.user_id,
            status: todo.status
        }));
        res.status(200).json(formattedTodos);
    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Update user by ID
router.put('/users/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { email, name, firstname, password } = req.body;

    try {
        const [userCheck] = await db.promise().query('SELECT * FROM user WHERE id = ?', [id]);
        if (userCheck.length === 0) {
            return res.status(404).json({ msg: "Not found" });
        }

        // return if the modified email is used by another account
        if (email) {
            const [emailCheck] = await db.promise().query(
                'SELECT id FROM user WHERE email = ? AND id != ?',
                [email, id]
            );
            if (emailCheck.length > 0) {
                return res.status(409).json({ msg: "Email already in use" });
            }
        }

        // modify the given content with provided infos
        const fields = [];
        const values = [];
        const addField = (column, value) => {
            fields.push(`${column} = ?`);
            values.push(value);
        };
        if (email) addField('email', email);
        if (name) addField('name', name);
        if (firstname) addField('firstname', firstname);
        if (password) addField('password', await bcrypt.hash(password, 10));
        if (fields.length === 0) {
            return res.status(400).json({ msg: "Bad parameter" });
        }
        const updateQuery = `UPDATE user SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);
        await db.promise().query(updateQuery, values);
        const [updatedUser] = await db.promise().query(
            'SELECT id, email, name, firstname, password, created_at FROM user WHERE id = ?',
            [id]
        );

        const u = updatedUser[0];

        // format print
        res.status(200).json({
            id: u.id,
            email: u.email,
            password: u.password,
            created_at: formatDate(u.created_at),
            firstname: u.firstname,
            name: u.name
        });
    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Delete user by ID
router.delete('/users/:id', auth, async (req, res) => {
    const { id } = req.params;
    
    try {
        const [userCheck] = await db.promise().query('SELECT * FROM user WHERE id = ?', [id]);
        if (userCheck.length === 0) {
            return res.status(404).json({ msg: "Not found" });
        }
        
        // delete the user
        await db.promise().query('DELETE FROM user WHERE id = ?', [id]);
        res.status(200).json({ msg: `Successfully deleted record number: ${id}` });
    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

module.exports = router;
