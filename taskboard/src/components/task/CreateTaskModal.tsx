"use client";
import { useState } from "react";
import { X } from "lucide-react";
import type { Label, Priority, Status } from "@/types";
import { PRIORITY_CONFIG, COLUMNS } from "@/types";

interface CreateTaskModalProps {
  labels: Label[];
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    description?: string;
    priority?: Priority;
    due_date?: string | null;
    status?: Status;
    labelIds?: string[];
  }) => Promise<void>;
}

export function CreateTaskModal({
  labels,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [status, setStatus] = useState<Status>("todo");
  const [dueDate, setDueDate] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) return;
    setLoading(true);
    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      due_date: dueDate || null,
      labelIds: selectedLabels,
    });
    setLoading(false);
  }

  const toggleLabel = (id: string) =>
    setSelectedLabels((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-strong)",
          boxShadow: "var(--shadow-modal)",
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            New Task
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "var(--text-tertiary)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
            placeholder="Task title"
            className="w-full text-base font-bold bg-transparent outline-none"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
            }}
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description…"
            className="w-full bg-transparent text-sm outline-none resize-none"
            style={{ color: "var(--text-secondary)", minHeight: "64px" }}
          />

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="STATUS">
              <SelectInput
                value={status}
                onChange={(v) => setStatus(v as Status)}
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </SelectInput>
            </FieldGroup>

            <FieldGroup label="PRIORITY">
              <SelectInput
                value={priority}
                onChange={(v) => setPriority(v as Priority)}
              >
                {(["low", "normal", "high"] as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_CONFIG[p].label}
                  </option>
                ))}
              </SelectInput>
            </FieldGroup>
          </div>

          {/* Due date */}
          <FieldGroup label="DUE DATE">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </FieldGroup>

          {/* Labels */}
          {labels.length > 0 && (
            <FieldGroup label="LABELS">
              <div className="flex flex-wrap gap-1.5">
                {labels.map((l) => {
                  const active = selectedLabels.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => toggleLabel(l.id)}
                      className="text-xs px-2.5 py-1 rounded-full transition-all"
                      style={{
                        background: active
                          ? `${l.color}28`
                          : "var(--surface-3)",
                        color: active ? l.color : "var(--text-secondary)",
                        border: `1px solid ${active ? l.color : "var(--border)"}`,
                        fontFamily: "var(--font-display)",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </FieldGroup>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || loading}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40 hover:brightness-110 active:scale-95"
            style={{
              background: "var(--accent)",
              color: "#0b0d12",
              fontFamily: "var(--font-display)",
            }}
          >
            {loading ? "Creating…" : "Create Task"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ── Shared ModalOverlay ── */
export function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}

/* ── Small helpers ── */
function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="text-xs mb-1.5 block"
        style={{
          color: "var(--text-tertiary)",
          fontFamily: "var(--font-display)",
          letterSpacing: "0.06em",
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-sm appearance-none cursor-pointer"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
        outline: "none",
      }}
    >
      {children}
    </select>
  );
}
