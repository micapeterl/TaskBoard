"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquare, Calendar, Flag } from "lucide-react";
import { cn, getDueDateStatus } from "@/lib/utils";
import { PRIORITY_CONFIG } from "@/types";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragOverlay?: boolean;
}

export function TaskCard({ task, onClick, isDragOverlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDateStatus = getDueDateStatus(task.due_date);
  const priorityCfg = PRIORITY_CONFIG[task.priority];

  const STATUS_COLORS: Record<string, string> = {
  todo:        "#94a3b8",
  in_progress: "#f59e0b",
  in_review:   "#818cf8",
  done:        "#34d399",
};
const statusGradientColor = STATUS_COLORS[task.status] ?? "#94a3b8";

  return (
    <div
      ref={setNodeRef}
      style={{
        background: `linear-gradient(to bottom, ${statusGradientColor}18 0%, var(--surface-2) 55%)`,
        border: "1px solid var(--border)",
        ...(isDragOverlay
          ? { boxShadow: "var(--shadow-modal)", border: "1px solid var(--border-strong)" }
          : {}),
      }}
      {...attributes}
      {...listeners}
      onClick={!isDragging ? onClick : undefined}
      className={cn(
        "group rounded-lg p-3 cursor-pointer select-none transition-all duration-150",
        isDragging && "opacity-40 scale-[0.97]"
      )}
      onMouseEnter={(e) => {
        if (!isDragging && !isDragOverlay) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border-strong)";
          el.style.background = `linear-gradient(to bottom, ${statusGradientColor}28 0%, var(--surface-3) 55%)`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragOverlay) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border)";
          el.style.background = `linear-gradient(to bottom, ${statusGradientColor}18 0%, var(--surface-2) 55%)`;
        }
      }}
    >
      {/* High/Low priority top strip */}
      {task.priority !== "normal" && (
        <div
          className="w-full h-[2px] rounded-full mb-2.5"
          style={{ background: priorityCfg.color, opacity: 0.8 }}
        />
      )}

      {/* Title */}
      <p
        className="text-sm font-semibold leading-snug mb-2"
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.015em",
        }}
      >
        {task.title}
      </p>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.labels.map((l) => (
            <span
              key={l.id}
              className="rounded-full"
              style={{
                background: `${l.color}22`,
                color: l.color,
                border: `1px solid ${l.color}44`,
                fontSize: "10px",
                fontWeight: 700,
                padding: "1px 7px",
                letterSpacing: "0.03em",
                fontFamily: "var(--font-display)",
              }}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.priority !== "normal" && (
            <span
              className="flex items-center gap-1"
              style={{ color: priorityCfg.color }}
            >
              <Flag size={11} strokeWidth={2.5} />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  fontFamily: "var(--font-display)",
                }}
              >
                {task.priority}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Comment count */}
          {(task.comment_count ?? 0) > 0 && (
            <span
              className="flex items-center gap-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              <MessageSquare size={11} />
              <span style={{ fontSize: "11px" }}>{task.comment_count}</span>
            </span>
          )}

          {/* Due date badge */}
          {task.due_date && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
              style={{
                fontSize: "11px",
                color:
                  dueDateStatus === "overdue"
                    ? "var(--priority-high)"
                    : dueDateStatus === "soon"
                    ? "var(--priority-normal)"
                    : "var(--text-tertiary)",
                background:
                  dueDateStatus === "overdue"
                    ? "#f43f5e18"
                    : dueDateStatus === "soon"
                    ? "#f59e0b18"
                    : "transparent",
                fontFamily: "var(--font-display)",
                fontWeight: dueDateStatus !== "normal" ? 600 : 400,
              }}
            >
              <Calendar size={11} />
              {new Date(task.due_date + "T12:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
