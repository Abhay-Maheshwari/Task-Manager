import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { Session } from "@supabase/supabase-js";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  email?: string;
}

function TaskManager({ session }: { session: Session }) {
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const fetchTasks = async () => {
    const { error, data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error reading task: ", error.message);
      return;
    }

    setTasks(data || []);
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task: ", error.message);
      return;
    }
    
    // Refresh the task list after deletion
    fetchTasks();
  };

  const updateTask = async (id: number) => {
    const { error } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", id);

    if (error) {
      console.error("Error updating task: ", error.message);
      return;
    }
    
    // Refresh the task list after update
    fetchTasks();
    setNewDescription("");
  };



  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const { error, data } = await supabase
        .from("tasks")
        .insert({ 
          title: newTask.title, 
          description: newTask.description, 
          email: session.user.email
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding task: ", error.message);
        setSubmitMessage(`Error: ${error.message}`);
        return;
      }

      // Clear form and refresh tasks
      setNewTask({ title: "", description: "" });
      setSubmitMessage("Task added successfully!");
      
      // Refresh the task list
      await fetchTasks();
      
    } catch (error) {
      console.error("Unexpected error:", error);
      setSubmitMessage("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };



  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const channel = supabase.channel("tasks-channel");
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          const newTask = payload.new as Task;
          setTasks((prev) => [...prev, newTask]);
        }
      )
      .subscribe((status) => {
        console.log("Subscription: ", status);
      });
  }, []);

  console.log("Current tasks:", tasks);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h2>Task Manager CRUD</h2>

      {/* Form to add a new task */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, title: e.target.value }))
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          required
        />
        <textarea
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, description: e.target.value }))
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          required
        />



        <button 
          type="submit" 
          style={{ padding: "0.5rem 1rem" }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Task"}
        </button>
        
        {submitMessage && (
          <div style={{ 
            marginTop: "0.5rem", 
            padding: "0.5rem", 
            backgroundColor: submitMessage.includes("Error") ? "#ffebee" : "#e8f5e8",
            color: submitMessage.includes("Error") ? "#c62828" : "#2e7d32",
            borderRadius: "4px"
          }}>
            {submitMessage}
          </div>
        )}
      </form>

      {/* List of Tasks */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Tasks ({tasks.length})</h3>
        {tasks.length === 0 && <p>No tasks found. Add one above!</p>}
      </div>
      
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task, key) => (
          <li
            key={task.id || key}
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <div>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <div>
                <textarea
                  placeholder="Updated description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
                <button
                  style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
                  onClick={() => updateTask(task.id)}
                >
                  Edit
                </button>
                <button
                  style={{ padding: "0.5rem 1rem" }}
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskManager;
