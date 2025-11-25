// import express from "express";
// import cors from "cors";

// const app = express();
// app.use(cors());
// app.use(express.json());

// const users = [
//   { username: "admin", password: "1234" },
//   { username: "guest", password: "guest" },
// ];

// app.post("/login", (req, res) => {
//   const { username, password } = req.body;
//   const user = users.find(
//     (u) => u.username === username && u.password === password
//   );
//   if (user) {
//     res.json({ success: true, message: "Login successful" });
//   } else {
//     res.json({ success: false, message: "Invalid credentials" });
//   }
// });
// app.listen(4000, () => console.log("Server running on http://localhost:4000"));



// import express from "express";
// import cors from "cors";
// import mysql from "mysql2/promise";

// const app = express();
// app.use(cors());
// app.use(express.json());

// const db = mysql.createPool({
//     host: "localhost",      // your MySQL host
//     user: "root",           // your MySQL username
//     password: "",           // your MySQL password
//     database: "typescript2",    // your database name
//   });

// db.getConnection()
//       .then(() => console.log("Connected to MySQL database"))
//       .catch((err) => console.error("Database connection failed:", err));

//         app.post("/login", async (req, res) => {
//         const { username, password } = req.body;

//   try {
//     const [rows]: any = await db.query(
//       "SELECT * FROM users WHERE username = ? AND password = ?",
//       [username, password]
//     );

//     if (rows.length > 0) {
//       res.json({ success: true, message: "Login successful" });
//     } else {
//       res.json({ success: false, message: "Invalid credentials" });
//     }
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// app.listen(4000, () => console.log("Server running on http://localhost:4000"));


// import express from "express";
// import cors from "cors";
// import mysql from "mysql2/promise";
// import { OAuth2Client } from "google-auth-library";

// const app = express();
// app.use(cors());
// app.use(express.json());

// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "typescript2",
// });

// const client = new OAuth2Client("1086691988405-opihco32qu4kn93c8hehopbfg73nb3ic.apps.googleusercontent.com");

// // === Existing username/password login ===
// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const [rows]: any = await db.query(
//       "SELECT * FROM users WHERE username = ? AND password = ?",
//       [username, password]
//     );

//     if (rows.length > 0) {
//       res.json({
//         success: true,
//         fullname: rows[0].fullname,
//         message: "Login successful",
//       });
//     } else {
//       res.json({ success: false, message: "Invalid credentials" });
//     }
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // === Google login route ===
// app.post("/google-login", async (req, res) => {
//   const { token } = req.body;

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: "1086691988405-opihco32qu4kn93c8hehopbfg73nb3ic.apps.googleusercontent.com",
//     });

//     const payload = ticket.getPayload();
//     if (!payload) {
//       return res.status(400).json({ success: false, message: "Invalid token" });
//     }

//     const { email, name, sub } = payload;

//     const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);

//     if (rows.length === 0) {
//       await db.query(
//         "INSERT INTO users (fullname, email, google_id) VALUES (?, ?, ?)",
//         [name, email, sub]
//       );
//     }

//     res.json({
//       success: true,
//       fullname: name,
//       email,
//       message: "Google login successful",
//     });
//   } catch (error) {
//     console.error("Google login error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// app.listen(4000, () => console.log("Server running on http://localhost:4000"));




import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { OAuth2Client } from "google-auth-library";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL Connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "typescript2",
});

// ✅ Google OAuth Client
const client = new OAuth2Client(
  "1086691988405-opihco32qu4kn93c8hehopbfg73nb3ic.apps.googleusercontent.com"
);

// ---------------------------
// 🧩 REGISTER
// ---------------------------
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.json({ success: false, message: "All fields are required." });
  }

  try {
    const [rows]: any = await db.query("SELECT * FROM users WHERE username = ?", [username]);

    if (Array.isArray(rows) && rows.length > 0) {
      return res.json({ success: false, message: "Username already exists." });
    }

    await db.query(
      "INSERT INTO users (username, password, fullname, email, google_id, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, password, "", "", "", role]
    );

    res.json({ success: true, message: "Registration successful." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ---------------------------
// 🧩 LOGIN
// ---------------------------
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      const user = rows[0];
      res.json({
        success: true,
        fullname: user.fullname,
        role: user.role,
        message: "Login successful.",
      });
    } else {
      res.json({ success: false, message: "Invalid credentials." });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ---------------------------
// 🧩 GOOGLE LOGIN (Fixed)
// ---------------------------
app.post("/google-login", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "1086691988405-opihco32qu4kn93c8hehopbfg73nb3ic.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ success: false, message: "Invalid Google token." });
    }

    const { email, name, sub } = payload;

    // ✅ Check if user already exists
    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      // Create new user if not exists
      await db.query(
        "INSERT INTO users (username, password, fullname, email, google_id, role) VALUES (?, ?, ?, ?, ?, ?)",
        [email, "", name, email, sub, "user"]
      );
      console.log(`New Google user created: ${email}`);
    } else {
      console.log(`Existing Google user logged in: ${email}`);
    }

    res.json({
      success: true,
      fullname: name,
      email,
      role: "user",
      message: "Google login successful.",
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ success: false, message: "Google authentication failed." });
  }
});

// ---------------------------
// 🧩 DEPARTMENTS CRUD
// ---------------------------
app.get("/departments", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM departments");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/departments", async (req, res) => {
  const { abbreviation, name, description, status } = req.body;

  try {
    await db.query(
      "INSERT INTO departments (abbreviation, name, description, status) VALUES (?, ?, ?, ?)",
      [abbreviation, name, description, status]
    );
    res.json({ success: true, message: "Department added successfully" });
  } catch (error) {
    console.error("Error adding department:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/departments/:id", async (req, res) => {
  const { id } = req.params;
  const { abbreviation, name, description, status } = req.body;

  try {
    const [result]: any = await db.query(
      "UPDATE departments SET abbreviation = ?, name = ?, description = ?, status = ? WHERE id = ?",
      [abbreviation, name, description, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({ success: true, message: "Department updated successfully" });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/departments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result]: any = await db.query("DELETE FROM departments WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    res.json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------------------
// 🚀 SERVER START
// ---------------------------
app.listen(4000, () => console.log("✅ Server running on http://localhost:4000"));
