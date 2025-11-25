const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",         // your MySQL username
  password: "yourpassword", // your MySQL password
  database: "todo_db"   // your database
});

db.connect((err) => {
  if (err) console.error("MySQL connection error:", err);
  else console.log("Connected to MySQL database");
});

// Create todos table if not exists
db.query(`
CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE
)`, (err) => { if(err) console.error(err); });

// --- CRUD API --- //

// Get all todos
app.get("/todos", (req, res) => {
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add new todo
app.post("/todos", (req, res) => {
  const { task } = req.body;
  db.query("INSERT INTO todos (task) VALUES (?)", [task], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: results.insertId, task, completed: 0 });
  });
});

// Update todo (toggle complete)
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  db.query("UPDATE todos SET completed = ? WHERE id = ?", [completed, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, completed });
  });
});

// Delete todo
app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM todos WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id });
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
