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

  // Fetch todos from backend
  const fetchTodos = async () => {
    const res = await axios.get("http://localhost:5000/todos");
    setTodos(res.data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Create
  const addTodo = async () => {
    if (!newTask.trim()) return;
    const res = await axios.post("http://localhost:5000/todos", { task: newTask });
    setTodos([...todos, res.data]);
    setNewTask("");
  };

  // Toggle completion
  const toggleTodo = async (todo: Todo) => {
    await axios.put(`http://localhost:5000/todos/${todo.id}`, {
      task: todo.task,
      completed: !todo.completed
    });
    fetchTodos();
  };

  // Delete
  const deleteTodo = async (id: number) => {
    await axios.delete(`http://localhost:5000/todos/${id}`);
    fetchTodos();
  };

  // Start editing
  const startEditing = (id: number, task: string) => {
    setEditingId(id);
    setEditingTask(task);
  };

  // Save edit
  const saveEdit = async (todo: Todo) => {
    await axios.put(`http://localhost:5000/todos/${todo.id}`, {
      task: editingTask,
      completed: todo.completed
    });
    setEditingId(null);
    setEditingTask("");
    fetchTodos();
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
                <span onClick={() => toggleTodo(todo)}>{todo.task}</span>
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
