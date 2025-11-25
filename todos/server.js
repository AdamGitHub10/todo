const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // replaces body-parser

// MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected!");
});

// Get all todos
app.get("/todos", (req, res) => {
  connection.query("SELECT * FROM todos", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add a new todo
app.post("/todos", (req, res) => {
  const { task } = req.body;
  connection.query("INSERT INTO todos (task) VALUES (?)", [task], (err, result) => {
    if (err) return res.status(500).send(err);
    connection.query("SELECT * FROM todos WHERE id = ?", [result.insertId], (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results[0]);
    });
  });
});

// Update todo
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;
  connection.query(
    "UPDATE todos SET task = ?, completed = ? WHERE id = ?",
    [task, completed, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(200);
    }
  );
});

// Delete todo
app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  connection.query("DELETE FROM todos WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// Dynamic port for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
