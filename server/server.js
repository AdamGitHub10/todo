const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

// Use CORS and allow only your frontend domain
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));

// Parse JSON requests
app.use(express.json());

// Database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "todo_db",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1); // Stop the server if DB connection fails
  }
  console.log("MySQL connected!");
});

// Fetch all todos
app.get("/todos", (req, res) => {
  db.query("SELECT * FROM todos", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});

// Add a new todo
app.post("/todos", (req, res) => {
  const { task } = req.body;
  if (!task || task.trim() === "") {
    return res.status(400).json({ error: "Task cannot be empty" });
  }

  db.query(
    "INSERT INTO todos (task, completed) VALUES (?, ?)",
    [task, false],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ id: result.insertId, task, completed: false });
    }
  );
});

// Update a todo
app.put("/todos/:id", (req, res) => {
  const { task, completed } = req.body;
  db.query(
    "UPDATE todos SET task=?, completed=? WHERE id=?",
    [task, completed, req.params.id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ id: req.params.id, task, completed });
    }
  );
});

// Delete a todo
app.delete("/todos/:id", (req, res) => {
  db.query("DELETE FROM todos WHERE id=?", [req.params.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true });
  });
});

// Use dynamic port for Render deployment
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
