const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "todo_db"
});

// Fetch all todos
app.get("/todos", (req, res) => {
  db.query("SELECT * FROM todos", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Add todo
app.post("/todos", (req, res) => {
  const { task } = req.body;
  db.query(
    "INSERT INTO todos (task, completed) VALUES (?, ?)",
    [task, false],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId, task, completed: false });
    }
  );
});

// Update todo
app.put("/todos/:id", (req, res) => {
  const { task, completed } = req.body;
  db.query(
    "UPDATE todos SET task=?, completed=? WHERE id=?",
    [task, completed, req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ id: req.params.id, task, completed });
    }
  );
});

// Delete todo
app.delete("/todos/:id", (req, res) => {
  db.query("DELETE FROM todos WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
