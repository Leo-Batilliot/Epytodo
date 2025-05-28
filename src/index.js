require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./config/db');
const { initializeDatabase } = require('./config/init_db');

// Import routes
const authRoutes = require('./routes/auth/auth');
const userRoutes = require('./routes/users/user');
const todosRoutes = require('./routes/todos/todos');

// Middleware
app.use(express.json());

// Route d'accueil
app.get('/', (req, res) => {
  res.status(200).json({ msg: "Welcome to EpyTodo API" });
});

// Appliquer toutes les routes
app.use(authRoutes);
app.use(userRoutes);
app.use(todosRoutes);

// gestion des erreurs
app.use((req, res, next) => {
  res.status(404).json({ msg: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Internal server error" });
});

// Initialize database and start server
const PORT = process.env.PORT || 3000;

// First initialize the database, then start the server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize application:', err);
    process.exit(1); // Exit the application if database initialization fails
  });

module.exports = app;