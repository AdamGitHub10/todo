const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // your MySQL username
  password: "",       // your MySQL password
  database: "todo_app"
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected!");
});

// Get all todos
app.get("/todos", (req, res) => {
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add a new todo
app.post("/todos", (req, res) => {
  const { task } = req.body;
  db.query("INSERT INTO todos (task) VALUES (?)", [task], (err, result) => {
    if (err) return res.status(500).send(err);
    db.query("SELECT * FROM todos WHERE id = ?", [result.insertId], (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results[0]);
    });
  });
});

// Update todo
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;
  db.query(
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
  db.query("DELETE FROM todos WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
