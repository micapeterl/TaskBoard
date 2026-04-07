"use client";
import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type { Column as ColumnType, Task } from "@/types";
import { TaskCard } from "../task/TaskCard";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  loading: boolean;
  isOver: boolean;
  onTaskClick: (t: Task) => void;
  onQuickAdd: (title: string) => void;
}

export function Column({
  column,
  tasks,
  loading,
  isOver,
  onTaskClick,
  onQuickAdd,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [quickTitle, setQuickTitle] = useState("");
  const [addingQuick, setAddingQuick] = useState(false);

  function handleQuickSubmit() {
    if (quickTitle.trim()) {
      onQuickAdd(quickTitle.trim());
    }
    setQuickTitle("");
    setAddingQuick(false);
  }

  return (
    <div
      className="flex-shrink-0 flex flex-col w-[288px] rounded-xl transition-all duration-200"
      style={{
        background: isOver ? "var(--accent-subtle)" : "var(--surface-1)",
        border: `1px solid ${isOver ? "var(--accent-muted)" : "var(--border)"}`,
        minHeight: "220px",
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: column.accentColor }}
          />
          <h2
            className="text-sm"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.015em",
            }}
          >
            {column.label}
          </h2>
          <span
            className="text-xs px-1.5 py-0.5 rounded-md tabular-nums"
            style={{
              background: "var(--surface-3)",
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
            }}
          >
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => setAddingQuick(true)}
          className="p-1 rounded-md transition-colors hover:bg-white/5"
          style={{ color: "var(--text-tertiary)" }}
          title="Quick add task"
        >
          <Plus size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Tasks list — droppable */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-2 p-3"
        style={{ minHeight: "80px" }}
      >
        {loading ? (
          <>
            <SkeletonCard wide />
            <SkeletonCard />
          </>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}

        {!loading && tasks.length === 0 && !addingQuick && (
          <EmptyState columnLabel={column.label} />
        )}

        {/* Quick-add inline input */}
        {addingQuick && (
          <div
            className="rounded-lg p-3 animate-scale-in"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-strong)",
            }}
          >
            <input
              autoFocus
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleQuickSubmit();
                if (e.key === "Escape") {
                  setQuickTitle("");
                  setAddingQuick(false);
                }
              }}
              onBlur={handleQuickSubmit}
              placeholder="Task title… (Enter to save)"
              className="w-full bg-transparent text-sm outline-none"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ columnLabel }: { columnLabel: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2.5 select-none">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: "var(--surface-3)",
          border: "1.5px dashed var(--border-strong)",
        }}
      >
        <span style={{ color: "var(--text-tertiary)", fontSize: "1rem" }}>○</span>
      </div>
      <p
        className="text-xs text-center"
        style={{ color: "var(--text-tertiary)" }}
      >
        No {columnLabel.toLowerCase()} tasks
      </p>
    </div>
  );
}

function SkeletonCard({ wide }: { wide?: boolean }) {
  return (
    <div
      className="rounded-lg p-3 space-y-2.5"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
    >
      <div
        className={`h-3 rounded-full shimmer ${wide ? "w-4/5" : "w-2/3"}`}
      />
      <div className="h-2.5 rounded-full w-1/2 shimmer" />
    </div>
  );
}
