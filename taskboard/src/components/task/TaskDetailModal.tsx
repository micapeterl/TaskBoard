"use client";
import { useState, useEffect, useRef } from "react";
import { X, Trash2, MessageSquare, Activity } from "lucide-react";
import { ModalOverlay } from "./CreateTaskModal";
import { useTaskDetail } from "@/hooks/useTaskDetail";
import { formatRelativeTime, getDueDateStatus } from "@/lib/utils";
import { PRIORITY_CONFIG, STATUS_CONFIG, COLUMNS } from "@/types";
import type { Task, Label, Priority, Status } from "@/types";


interface TaskDetailModalProps {
  task: Task;
  labels: Label[];
  onClose: () => void;
  onUpdate: (
    id: string,
    updates: Partial<Task>,
    labelIds?: string[]
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskDetailModal({
  task,
  labels,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState<Status>(task.status);
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [selectedLabels, setSelectedLabels] = useState(
    task.labels?.map((l) => l.id) ?? []
  );
  const [commentText, setCommentText] = useState("");
  const [tab, setTab] = useState<"comments" | "activity">("comments");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pendingLabels = useRef<string[] | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { comments, activity, loadingDetail, fetchDetail, addComment } =
    useTaskDetail(task.id);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);


  async function handleSave(overrides?: {
    labelOverride?: string[];
    statusOverride?: Status;
    priorityOverride?: Priority;
    dueDateOverride?: string;
  }) {
    // For label changes, debounce so rapid multi-selects batch into one save
    if (overrides?.labelOverride !== undefined) {
      pendingLabels.current = overrides.labelOverride;
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        await onUpdate(
          task.id,
          {
            title: title.trim() || task.title,
            description: description.trim() || null,
            priority,
            status,
            due_date: dueDate || null,
          },
          pendingLabels.current ?? selectedLabels
        );
        pendingLabels.current = null;
      }, 400);
      return;
    }

    // For all other fields, save immediately
    await onUpdate(
      task.id,
      {
        title: title.trim() || task.title,
        description: description.trim() || null,
        priority: overrides?.priorityOverride ?? priority,
        status: overrides?.statusOverride ?? status,
        due_date:
          overrides?.dueDateOverride !== undefined
            ? overrides.dueDateOverride || null
            : dueDate || null,
      },
      selectedLabels
    );
  }

  async function handleAddComment() {
    if (!commentText.trim()) return;
    await addComment(commentText.trim());
    setCommentText("");
  }

  const toggleLabel = (id: string) =>
    setSelectedLabels((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );

  const dueDateStatus = getDueDateStatus(dueDate);

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-strong)",
          boxShadow: "var(--shadow-modal)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span
            style={{
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-display)",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              fontWeight: 700,
            }}
          >
            TASK DETAILS
          </span>

          <div className="flex items-center gap-1.5">
            {confirmDelete ? (
              <>
                <span
                  className="text-xs mr-1"
                  style={{ color: "var(--priority-high)" }}
                >
                  Delete this task?
                </span>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                  style={{
                    background: "#f43f5e",
                    color: "white",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{
                    background: "var(--surface-3)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "var(--text-tertiary)" }}
                title="Delete task"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: "var(--text-tertiary)" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Title */}
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleSave()}
              className="w-full bg-transparent text-xl font-bold outline-none resize-none"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.025em",
                lineHeight: 1.3,
                minHeight: "auto",
              }}
            />

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleSave()}
              placeholder="Add a description…"
              className="w-full bg-transparent text-sm outline-none resize-none"
              style={{
                color: "var(--text-secondary)",
                minHeight: "56px",
                lineHeight: 1.6,
              }}
            />

            {/* Properties */}
            <div className="grid grid-cols-2 gap-3">
              <PropertyField label="STATUS">
                <select
                  value={status}
                  onChange={(e) => {
                    const next = e.target.value as Status;
                    setStatus(next);
                    handleSave({ statusOverride: next });
                  }}
                  className="w-full px-2.5 py-2 rounded-lg text-sm appearance-none"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                >
                  {COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </PropertyField>

              <PropertyField label="PRIORITY">
                <select
                  value={priority}
                  onChange={(e) => {
                    const next = e.target.value as Priority;
                    setPriority(next);
                    handleSave({ priorityOverride: next });
                  }}
                  className="w-full px-2.5 py-2 rounded-lg text-sm appearance-none"
                  style={{
                    background: "var(--surface-2)",
                    border: `1px solid ${PRIORITY_CONFIG[priority].color}50`,
                    color: PRIORITY_CONFIG[priority].color,
                    outline: "none",
                  }}
                >
                  {(["low", "normal", "high"] as Priority[]).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_CONFIG[p].label}
                    </option>
                  ))}
                </select>
              </PropertyField>

              <PropertyField label="DUE DATE">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    const next = e.target.value;
                    setDueDate(next);
                    handleSave({ dueDateOverride: next });
                  }}
                  className="w-full px-2.5 py-2 rounded-lg text-sm"
                  style={{
                    background: "var(--surface-2)",
                    border: `1px solid ${
                      dueDateStatus === "overdue"
                        ? "#f43f5e40"
                        : dueDateStatus === "soon"
                        ? "#f59e0b40"
                        : "var(--border)"
                    }`,
                    color:
                      dueDateStatus === "overdue"
                        ? "var(--priority-high)"
                        : "var(--text-primary)",
                    outline: "none",
                  }}
                />
              </PropertyField>

              <PropertyField label="CREATED">
                <p
                  className="text-sm px-2.5 py-2"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {formatRelativeTime(task.created_at)}
                </p>
              </PropertyField>
            </div>

            {/* Labels */}
            {labels.length > 0 && (
              <div>
                <p
                  className="text-xs mb-2"
                  style={{
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.06em",
                    fontWeight: 700,
                  }}
                >
                  LABELS
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((l) => {
                    const active = selectedLabels.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        onClick={() => {
                          const next = selectedLabels.includes(l.id)
                            ? selectedLabels.filter((x) => x !== l.id)
                            : [...selectedLabels, l.id];
                          setSelectedLabels(next);
                          handleSave({ labelOverride: next });
                        }}
                        className="text-xs px-2.5 py-1 rounded-full transition-all"
                        style={{
                          background: active
                            ? `${l.color}28`
                            : "var(--surface-3)",
                          color: active ? l.color : "var(--text-secondary)",
                          border: `1px solid ${
                            active ? l.color : "var(--border)"
                          }`,
                          fontFamily: "var(--font-display)",
                          fontWeight: active ? 700 : 400,
                        }}
                      >
                        {l.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comments / Activity */}
            <div style={{ borderTop: "1px solid var(--border)" }} className="pt-4">
              <div className="flex items-center gap-5 mb-4">
                {(["comments", "activity"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="flex items-center gap-1.5 text-sm pb-1.5 capitalize transition-colors"
                    style={{
                      color:
                        tab === t
                          ? "var(--text-primary)"
                          : "var(--text-tertiary)",
                      borderBottom:
                        tab === t
                          ? "2px solid var(--accent)"
                          : "2px solid transparent",
                      fontFamily: "var(--font-display)",
                      fontWeight: tab === t ? 700 : 400,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t === "comments" ? (
                      <MessageSquare size={13} />
                    ) : (
                      <Activity size={13} />
                    )}
                    {t}
                    {t === "comments" && comments.length > 0 && (
                      <span
                        className="text-xs px-1.5 rounded-full ml-0.5"
                        style={{
                          background: "var(--surface-3)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {comments.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {tab === "comments" ? (
                <div className="space-y-3">
                  {!loadingDetail && comments.length === 0 && (
                    <p
                      className="text-sm text-center py-6"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      No comments yet — be the first!
                    </p>
                  )}

                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg p-3"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-primary)", lineHeight: 1.6 }}
                      >
                        {c.body}
                      </p>
                      <p
                        className="text-xs mt-1.5"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {formatRelativeTime(c.created_at)}
                      </p>
                    </div>
                  ))}

                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleAddComment();
                      }
                    }}
                    placeholder="Write a comment… (⌘↵ to submit)"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      minHeight: "72px",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--border-strong)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "var(--border)")
                    }
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="w-full py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-opacity"
                    style={{
                      background: "var(--surface-3)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Add Comment
                  </button>
                </div>
              ) : (
                <div className="space-y-0">
                  {!loadingDetail && activity.length === 0 && (
                    <p
                      className="text-sm text-center py-6"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      No activity recorded yet
                    </p>
                  )}

                  {activity.map((a, i) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 py-3"
                      style={{
                        borderBottom:
                          i < activity.length - 1
                            ? "1px solid var(--border)"
                            : "none",
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0"
                        style={{ background: "var(--accent)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {a.type === "status_change" &&
                            `Moved from ${
                              STATUS_CONFIG[a.payload?.from as Status]?.label ??
                              a.payload?.from
                            } → ${
                              STATUS_CONFIG[a.payload?.to as Status]?.label ??
                              a.payload?.to
                            }`}
                          {a.type === "priority_change" &&
                            `Priority changed: ${a.payload?.from} → ${a.payload?.to}`}
                          {a.type === "created" && "Task created"}
                          {a.type === "comment" &&
                            `Commented: "${a.payload?.preview}${
                              (a.payload?.preview?.length ?? 0) >= 60
                                ? "…"
                                : ""
                            }"`}
                          {a.type === "edit" && "Task details edited"}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {formatRelativeTime(a.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

function PropertyField({
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
          fontWeight: 700,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
