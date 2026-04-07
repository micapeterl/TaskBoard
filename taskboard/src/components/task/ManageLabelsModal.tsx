"use client";
import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { ModalOverlay } from "./CreateTaskModal";
import type { Label } from "@/types";

const PRESET_COLORS = [
  "#f43f5e",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#34d399",
  "#38bdf8",
  "#818cf8",
  "#e879f9",
];

interface ManageLabelsModalProps {
  labels: Label[];
  onClose: () => void;
  onCreate: (name: string, color: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
}

export function ManageLabelsModal({
  labels,
  onClose,
  onCreate,
  onDelete,
}: ManageLabelsModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name.trim(), color);
    setName("");
    setLoading(false);
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-strong)",
          boxShadow: "var(--shadow-modal)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Manage Labels
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
          >
            <X size={16} style={{ color: "var(--text-tertiary)" }} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Existing labels */}
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {labels.length === 0 && (
              <p
                className="text-sm text-center py-4"
                style={{ color: "var(--text-tertiary)" }}
              >
                No labels yet — create one below
              </p>
            )}
            {labels.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: l.color }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {l.name}
                  </span>
                </div>
                <button
                  onClick={() => onDelete(l.id)}
                  className="p-1 rounded-md transition-colors hover:bg-white/5"
                  style={{ color: "var(--text-tertiary)" }}
                  title="Delete label"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Create new label */}
          <div
            className="space-y-3 pt-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <p
              className="text-xs"
              style={{
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              CREATE LABEL
            </p>

            {/* Color swatches */}
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-all flex-shrink-0"
                  style={{
                    background: c,
                    outline: color === c ? `2.5px solid ${c}` : "none",
                    outlineOffset: "2px",
                    transform: color === c ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            {/* Name input + create button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                  style={{ background: color }}
                />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Label name"
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-strong)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                className="px-3 py-2 rounded-lg disabled:opacity-40 transition-opacity flex items-center gap-1.5 text-sm font-bold"
                style={{
                  background: "var(--accent)",
                  color: "#0b0d12",
                  fontFamily: "var(--font-display)",
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
