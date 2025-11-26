import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Environment API URL
const API = import.meta.env.VITE_API_URL;

// Format date to YYYY-MM-DD
const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const today = formatDate(new Date());

type Task = {
  id: number;
  title: string;
  date: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"today" | "pending" | "overdue">("today");
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch tasks
  useEffect(() => {
    axios
      .get<Task[]>(`${API}/tasks`)
      .then((res) => {
        const formattedTasks = res.data.map((t) => ({
          ...t,
          date: formatDate(t.date),
          completed: Boolean(t.completed),
        }));
        setTasks(formattedTasks);
      })
      .catch((err) => console.log(err));
  }, []);

  const priorityColor = {
    high: "#e74c3c",
    medium: "#f39c12",
    low: "#2ecc71",
  };

  // Toggle complete
  const toggleComplete = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    axios
      .put<Task>(`${API}/tasks/${id}`, { ...task, completed: !task.completed })
      .then(() =>
        setTasks(
          tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          )
        )
      );
  };

  // Delete task
  const deleteTask = (id: number) => {
    axios.delete(`${API}/tasks/${id}`).then(() => {
      setTasks(tasks.filter((t) => t.id !== id));
    });
  };

  // Update title
  const updateTaskTitle = (id: number, newTitle: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    axios
      .put<Task>(`${API}/tasks/${id}`, { ...task, title: newTitle })
      .then(() =>
        setTasks(
          tasks.map((t) =>
            t.id === id ? { ...t, title: newTitle } : t
          )
        )
      );
  };

  // Update date
  const updateTaskDate = (id: number, newDate: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    axios
      .put<Task>(`${API}/tasks/${id}`, { ...task, date: newDate })
      .then(() =>
        setTasks(
          tasks.map((t) =>
            t.id === id ? { ...t, date: newDate } : t
          )
        )
      );
  };

  // Add new task
  const addTask = (title: string, date: string, priority: "low" | "medium" | "high") => {
    axios
      .post<Task>(`${API}/tasks`, { title, date, priority })
      .then((res) => {
        const newTask = {
          ...res.data,
          date: formatDate(res.data.date),
        };

        setTasks([...tasks, newTask]);
        setActiveTab(newTask.date === today ? "today" : "pending");
        setShowAddModal(false);
      });
  };

  // Filter tasks per tab
  const getFilteredTasks = () => {
    const sorted = [...tasks].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const pending = sorted.filter((t) => !t.completed);
    const completed = sorted.filter((t) => t.completed);

    let filtered: Task[] = [];

    if (activeTab === "today") filtered = pending.filter((t) => t.date === today);
    if (activeTab === "pending") filtered = pending.filter((t) => t.date >= today);
    if (activeTab === "overdue") filtered = pending.filter((t) => t.date < today);

    const getTabCount = (tab: "today" | "pending" | "overdue") => {
      if (tab === "today") return pending.filter((t) => t.date === today).length;
      if (tab === "pending") return pending.filter((t) => t.date >= today).length;
      if (tab === "overdue") return pending.filter((t) => t.date < today).length;
      return 0;
    };

    return { active: filtered, completed, getTabCount };
  };

  const { active: activeTasks, completed: completedTasks, getTabCount } =
    getFilteredTasks();

  // Add Task Modal
  const AddTaskModal = () => {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(today);
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (title.trim()) addTask(title.trim(), date, priority);
    };

    return (
      <div className="modal-backdrop">
        <form className="modal" onSubmit={handleSubmit}>
          <h3>Add New Task</h3>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
            required
          />

          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="modal-buttons">
            <button type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit">Save Task</button>
          </div>
        </form>
      </div>
    );
  };

  // Task Item Component
  const TaskItem = ({ task }: { task: Task }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(task.title);
    const [newDate, setNewDate] = useState(task.date);

    const handleSave = () => {
      if (newTitle.trim() && newTitle.trim() !== task.title)
        updateTaskTitle(task.id, newTitle.trim());

      if (newDate !== task.date) updateTaskDate(task.id, newDate);

      setIsEditing(false);
    };

    return (
      <li className={`task-item ${task.completed ? "completed" : ""}`}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleComplete(task.id)}
        />

        <div className="task-content">
          {isEditing ? (
            <>
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </>
          ) : (
            <>
              <span onClick={() => !task.completed && setIsEditing(true)}>
                {task.title}
              </span>
              <span
                className={`task-date ${
                  task.date < today && !task.completed ? "overdue" : ""
                }`}
              >
                {task.date === today ? "Today" : task.date}
              </span>
            </>
          )}
        </div>

        <span
          className="priority-dot"
          style={{ backgroundColor: priorityColor[task.priority] }}
        />

        <button onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
          {isEditing ? "Save" : "Edit"}
        </button>

        <button onClick={() => deleteTask(task.id)}>Delete</button>
      </li>
    );
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h1>Todo App</h1>
        <p>Organize your priorities</p>

        <div className="tabs">
          {["today", "pending", "overdue"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={activeTab === tab ? "active-tab" : ""}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({getTabCount(tab as any)})
            </button>
          ))}
        </div>

        <button className="new-task-btn" onClick={() => setShowAddModal(true)}>
          + New Task
        </button>
      </aside>

      <main className="main">
        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tasks</h2>

        <ul>
          {activeTasks.length > 0 ? (
            activeTasks.map((task) => <TaskItem key={task.id} task={task} />)
          ) : (
            <p className="no-tasks">No tasks found for "{activeTab}"</p>
          )}
        </ul>

        {completedTasks.length > 0 && (
          <div className="completed-section">
            <h3>Completed ({completedTasks.length})</h3>
            <ul>
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ul>
          </div>
        )}
      </main>

      {showAddModal && <AddTaskModal />}
    </div>
  );
}
