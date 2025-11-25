const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected!");
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

// Dynamic port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
