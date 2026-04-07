"use client";
import { useState } from "react";
import { Search, Plus, Tag, SlidersHorizontal, X } from "lucide-react";
import { CreateTaskModal } from "../task/CreateTaskModal";
import { ManageLabelsModal } from "../task/ManageLabelsModal";
import type { Label, Priority, Status } from "@/types";

interface HeaderProps {
  stats: { total: number; done: number; overdue: number };
  search: string;
  onSearchChange: (v: string) => void;
  filterPriority: string | null;
  onFilterPriority: (v: string | null) => void;
  filterLabel: string | null;
  onFilterLabel: (v: string | null) => void;
  labels: Label[];
  onCreateTask: (input: {
    title: string;
    description?: string;
    priority?: Priority;
    due_date?: string | null;
    status?: Status;
    labelIds?: string[];
  }) => Promise<unknown>;
  onCreateLabel: (name: string, color: string) => Promise<unknown>;
  onDeleteLabel: (id: string) => Promise<void>;
}

export function Header(props: HeaderProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const hasFilters = props.filterPriority || props.filterLabel;

  return (
    <>
      <header
        className="flex flex-col gap-3 px-6 py-4 sticky top-0 z-40"
        style={{
          background: "rgba(11,13,18,0.94)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
              style={{
                background: "var(--accent)",
                color: "#0b0d12",
                fontFamily: "var(--font-display)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              TB
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.125rem",
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              TaskBoard
            </h1>

            {/* Stats pills — hidden on small screens */}
            <div className="hidden md:flex items-center gap-2 ml-1">
              <StatPill label={`${props.stats.total} tasks`} />
              <StatPill
                label={`${props.stats.done} done`}
                color="var(--status-done)"
              />
              {props.stats.overdue > 0 && (
                <StatPill
                  label={`${props.stats.overdue} overdue`}
                  color="var(--priority-high)"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLabels(true)}
              className="p-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: "var(--text-secondary)" }}
              title="Manage labels"
            >
              <Tag size={16} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "var(--accent)",
                color: "#0b0d12",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.01em",
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>

        {/* Search + Filter row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              value={props.search}
              onChange={(e) => props.onSearchChange(e.target.value)}
              placeholder="Search tasks…"
              className="w-full pl-9 pr-8 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-strong)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            />
            {props.search && (
              <button
                onClick={() => props.onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded"
                style={{ color: "var(--text-tertiary)" }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              background: hasFilters ? "var(--accent-subtle)" : "var(--surface-2)",
              border: `1px solid ${hasFilters ? "var(--accent-muted)" : "var(--border)"}`,
              color: hasFilters ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filter</span>
            {hasFilters && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 animate-fade-in">
            <span
              className="text-xs"
              style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}
            >
              PRIORITY:
            </span>
            {(["low", "normal", "high"] as const).map((p) => (
              <FilterChip
                key={p}
                label={p}
                active={props.filterPriority === p}
                onClick={() =>
                  props.onFilterPriority(props.filterPriority === p ? null : p)
                }
              />
            ))}

            {props.labels.length > 0 && (
              <>
                <span
                  className="text-xs ml-2"
                  style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}
                >
                  LABEL:
                </span>
                {props.labels.map((l) => (
                  <FilterChip
                    key={l.id}
                    label={l.name}
                    color={l.color}
                    active={props.filterLabel === l.id}
                    onClick={() =>
                      props.onFilterLabel(
                        props.filterLabel === l.id ? null : l.id
                      )
                    }
                  />
                ))}
              </>
            )}

            {hasFilters && (
              <button
                onClick={() => {
                  props.onFilterPriority(null);
                  props.onFilterLabel(null);
                }}
                className="text-xs px-2 py-1 rounded-md transition-colors hover:bg-white/5"
                style={{ color: "var(--text-tertiary)", border: "1px solid var(--border)" }}
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </header>

      {showCreate && (
        <CreateTaskModal
          labels={props.labels}
          onClose={() => setShowCreate(false)}
          onSubmit={async (input) => {
            await props.onCreateTask(input);
            setShowCreate(false);
          }}
        />
      )}
      {showLabels && (
        <ManageLabelsModal
          labels={props.labels}
          onClose={() => setShowLabels(false)}
          onCreate={props.onCreateLabel}
          onDelete={props.onDeleteLabel}
        />
      )}
    </>
  );
}

function StatPill({ label, color }: { label: string; color?: string }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full"
      style={{
        background: color ? `${color}18` : "var(--surface-3)",
        color: color ?? "var(--text-tertiary)",
        border: `1px solid ${color ? `${color}30` : "var(--border)"}`,
        fontFamily: "var(--font-display)",
        letterSpacing: "0.02em",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-2.5 py-1 rounded-full capitalize transition-all"
      style={{
        background: active
          ? color
            ? `${color}28`
            : "var(--accent-muted)"
          : "var(--surface-2)",
        color: active ? (color ?? "var(--accent)") : "var(--text-secondary)",
        border: `1px solid ${active ? (color ?? "var(--accent)") : "var(--border)"}`,
        fontFamily: "var(--font-display)",
        fontWeight: active ? 600 : 400,
      }}
    >
      {color && (
        <span
          className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
          style={{ background: color }}
        />
      )}
      {label}
    </button>
  );
}
