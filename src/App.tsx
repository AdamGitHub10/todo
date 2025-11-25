import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState("");

  // Get backend API URL from environment variable
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      const res = await axios.get(`${API_URL}/todos`);
      setTodos(res.data);
    } catch (err) {
      console.error("Error fetching todos:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Create
  const addTodo = async () => {
    if (!newTask.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/todos`, { task: newTask });
      setTodos([...todos, res.data]);
      setNewTask("");
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };

  // Toggle completion
  const toggleTodo = async (todo: Todo) => {
    try {
      await axios.put(`${API_URL}/todos/${todo.id}`, {
        task: todo.task,
        completed: !todo.completed,
      });
      fetchTodos();
    } catch (err) {
      console.error("Error toggling todo:", err);
    }
  };

  // Delete
  const deleteTodo = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      fetchTodos();
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  // Start editing
  const startEditing = (id: number, task: string) => {
    setEditingId(id);
    setEditingTask(task);
  };

  // Save edit
  const saveEdit = async (todo: Todo) => {
    try {
      await axios.put(`${API_URL}/todos/${todo.id}`, {
        task: editingTask,
        completed: todo.completed,
      });
      setEditingId(null);
      setEditingTask("");
      fetchTodos();
    } catch (err) {
      console.error("Error saving edit:", err);
    }
  };

  return (
    <div className="app-container">
      <h1>Todo App (MySQL CRUD)</h1>

      <div className="input-container">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            {editingId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editingTask}
                  onChange={(e) => setEditingTask(e.target.value)}
                />
                <button onClick={() => saveEdit(todo)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>
                  {todo.task} — {todo.completed ? "Completed" : "Not Completed"}
                </span>

                {!todo.completed && (
                  <button onClick={() => toggleTodo(todo)}>Complete</button>
                )}

                <button onClick={() => startEditing(todo.id, todo.task)}>Edit</button>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
