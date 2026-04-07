export type Status = "todo" | "in_progress" | "in_review" | "done";
export type Priority = "low" | "normal" | "high";

export interface Label {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  // joined
  labels?: Label[];
  comment_count?: number;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface ActivityEntry {
  id: string;
  task_id: string;
  user_id: string;
  type: "status_change" | "edit" | "comment" | "created" | "priority_change";
  payload: Record<string, string | null> | null;
  created_at: string;
}

export interface Column {
  id: Status;
  label: string;
  color: string;
  accentColor: string;
}

export const COLUMNS: Column[] = [
  { id: "todo",        label: "To Do",       color: "var(--status-todo)",     accentColor: "#94a3b8" },
  { id: "in_progress", label: "In Progress", color: "var(--status-progress)", accentColor: "#f59e0b" },
  { id: "in_review",   label: "In Review",   color: "var(--status-review)",   accentColor: "#818cf8" },
  { id: "done",        label: "Done",        color: "var(--status-done)",     accentColor: "#34d399" },
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low:    { label: "Low",    color: "#64748b" },
  normal: { label: "Normal", color: "#f59e0b" },
  high:   { label: "High",   color: "#f43f5e" },
};

export const STATUS_CONFIG: Record<Status, { label: string }> = {
  todo:        { label: "To Do" },
  in_progress: { label: "In Progress" },
  in_review:   { label: "In Review" },
  done:        { label: "Done" },
};
