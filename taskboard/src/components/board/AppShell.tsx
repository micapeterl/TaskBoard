"use client";
import { useEffect, useState } from "react";
import { supabase, ensureGuestSession } from "@/lib/supabase";
import { Board } from "./Board";
import { Header } from "./Header";
import { useTasks } from "@/hooks/useTasks";
import { useLabels } from "@/hooks/useLabels";

export function AppShell() {
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, moveTask } =
    useTasks();
  const { labels, fetchLabels, createLabel, deleteLabel } = useLabels();

  useEffect(() => {
    ensureGuestSession().then(() => {
      setReady(true);
      fetchTasks();
      fetchLabels();
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchTasks();
      fetchLabels();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterLabel && !t.labels?.some((l) => l.id === filterLabel)) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => {
      if (!t.due_date || t.status === "done") return false;
      return new Date(t.due_date) < new Date();
    }).length,
  };

  if (!ready) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--surface-0)" }}>
      <Header
        stats={stats}
        search={search}
        onSearchChange={setSearch}
        filterPriority={filterPriority}
        onFilterPriority={setFilterPriority}
        filterLabel={filterLabel}
        onFilterLabel={setFilterLabel}
        labels={labels}
        onCreateTask={(input) => createTask(input)}
        onCreateLabel={createLabel}
        onDeleteLabel={deleteLabel}
      />
      {error && (
        <div
          className="mx-6 mt-4 px-4 py-3 rounded-lg text-sm"
          style={{
            background: "#f43f5e18",
            border: "1px solid #f43f5e40",
            color: "#f43f5e",
          }}
        >
          ⚠️ {error}
        </div>
      )}
      <Board
        tasks={filteredTasks}
        allTasks={tasks}
        labels={labels}
        loading={loading}
        onMove={moveTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onCreate={createTask}
      />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--surface-0)" }}
    >
      <div className="text-center space-y-4">
        <div
          className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl"
          style={{
            background: "var(--accent-subtle)",
            border: "1px solid var(--accent-muted)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          ⚡
        </div>
        <p
          style={{
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            letterSpacing: "0.12em",
          }}
        >
          LOADING TASKBOARD
        </p>
      </div>
    </div>
  );
}
