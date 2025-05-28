const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const auth = require('../../middleware/auth');

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

// print all todos
router.get('/todos', auth, async (req, res) => {
    try {
        const [todos] = await db.promise().query('SELECT * FROM todo');
        
        // format the print
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

// print todo by ID
router.get('/todos/:id', auth, async (req, res) => {
    const { id } = req.params;
    
    try {
        const [todo] = await db.promise().query('SELECT * FROM todo WHERE id = ?', [id]);
        
        if (todo.length === 0) {
            return res.status(404).json({ msg: "Not found" });
        }
        
        // format the print
        res.status(200).json({
            id: todo[0].id,
            title: todo[0].title,
            description: todo[0].description,
            created_at: formatDate(todo[0].created_at),
            due_time: formatDate(todo[0].due_time),
            user_id: todo[0].user_id,
            status: todo[0].status
        });
    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Create a new todo
router.post('/todos', auth, async (req, res) => {
    const { title, description, due_time, user_id, status } = req.body;

    if (!title || !description || !due_time) {
        return res.status(400).json({ msg: "Bad parameter" });
    }
    // if no user_id is provided uses the current logged in user id
    const todoUserId = user_id || req.user.id;
    // check if the status string contains a valid status
    const validStatuses = ['not started', 'todo', 'in progress', 'done'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ msg: "Bad parameter" });
    }

    try {
        const [userCheck] = await db.promise().query('SELECT id FROM user WHERE id = ?', [todoUserId]);
        if (userCheck.length === 0) {
            return res.status(404).json({ msg: "Not found" });
        }
        // insert the newly created todo in the database (uses "not started" status if not provided)
        const insertQuery = 'INSERT INTO todo (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, ?)';
        const insertValues = [
            title, 
            description, 
            due_time, 
            todoUserId,
            status || 'not started',
        ];
        const [result] = await db.promise().query(insertQuery, insertValues);
        const [newTodo] = await db.promise().query('SELECT * FROM todo WHERE id = ?', [result.insertId]);
        // format the print
        res.status(201).json({
            id: newTodo[0].id,
            title: newTodo[0].title,
            description: newTodo[0].description,
            created_at: formatDate(newTodo[0].created_at),
            due_time: formatDate(newTodo[0].due_time),
            user_id: newTodo[0].user_id,
            status: newTodo[0].status
        });
    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Update todo by ID
router.put('/todos/:id', auth, async (req, res) => {
    const { id } = req.params;
    const allowedFields = ['title', 'description', 'due_time', 'status', 'user_id'];
    const updateValues = [];
    const updateSet = [];

    try {
        const [todoCheck] = await db.promise().query('SELECT * FROM todo WHERE id = ?', [id]);
        if (todoCheck.length === 0) {
            return res.status(404).json({ msg: "Not found" });
        }

        // update fields if they are valid
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (field === 'status') {
                    if (!['not started', 'todo', 'in progress', 'done'].includes(req.body[field])) {
                        return res.status(400).json({ msg: "Bad parameter" });
                    }
                }
                if (field === 'user_id') {
                    const [userCheck] = await db.promise().query('SELECT id FROM user WHERE id = ?', [req.body.user_id]);
                    if (userCheck.length === 0) {
                        return res.status(404).json({ msg: "Not found" });
                    }
                }
                updateSet.push(`${field} = ?`);
                updateValues.push(req.body[field]);
            }
        }
        if (updateSet.length === 0) {
            return res.status(400).json({ msg: "Bad parameter" });
        }
        const updateQuery = `UPDATE todo SET ${updateSet.join(', ')} WHERE id = ?`;
        updateValues.push(id);
        await db.promise().query(updateQuery, updateValues);

        const [updatedTodo] = await db.promise().query('SELECT * FROM todo WHERE id = ?', [id]);
        //format print
        res.status(200).json({
            id: updatedTodo[0].id,
            title: updatedTodo[0].title,
            description: updatedTodo[0].description,
            created_at: formatDate(updatedTodo[0].created_at),
            due_time: formatDate(updatedTodo[0].due_time),
            user_id: updatedTodo[0].user_id,
            status: updatedTodo[0].status
        });
    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Delete todo by ID
router.delete('/todos/:id', auth, async (req, res) => {
    const { id } = req.params;
    
    try {
        const [todoCheck] = await db.promise().query('SELECT * FROM todo WHERE id = ?', [id]);
        if (todoCheck.length === 0) {
            return res.status(404).json({ msg: "Not found" });
        }
        
        // Delete todo
        await db.promise().query('DELETE FROM todo WHERE id = ?', [id]);

        res.status(200).json({ msg: `Successfully deleted record number: ${id}` });
    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

module.exports = router;