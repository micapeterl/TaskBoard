"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Task, Status, Priority, Label } from "@/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Fetch tasks with their labels
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        *,
        task_labels (
          labels ( id, name, color )
        )
      `)
      .eq("user_id", user.id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (tasksError) { setError(tasksError.message); setLoading(false); return; }

    // Fetch comment counts
    const taskIds = (tasksData ?? []).map((t) => t.id);
    let commentCounts: Record<string, number> = {};
    if (taskIds.length > 0) {
      const { data: counts } = await supabase
        .from("comments")
        .select("task_id")
        .in("task_id", taskIds);
      (counts ?? []).forEach((c: { task_id: string }) => {
        commentCounts[c.task_id] = (commentCounts[c.task_id] ?? 0) + 1;
      });
    }

    const shaped: Task[] = (tasksData ?? []).map((t) => ({
      ...t,
      labels: (t.task_labels ?? []).map((tl: { labels: Label }) => tl.labels),
      comment_count: commentCounts[t.id] ?? 0,
    }));

    setTasks(shaped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = useCallback(async (input: {
    title: string;
    description?: string;
    priority?: Priority;
    due_date?: string | null;
    status?: Status;
    labelIds?: string[];
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get current max position for this status
    const statusTasks = tasks.filter((t) => t.status === (input.status ?? "todo"));
    const position = statusTasks.length;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority ?? "normal",
        due_date: input.due_date ?? null,
        status: input.status ?? "todo",
        position,
      })
      .select()
      .single();

    if (error || !data) { setError(error?.message ?? "Failed to create task"); return null; }

    // Attach labels
    if (input.labelIds && input.labelIds.length > 0) {
      await supabase.from("task_labels").insert(
        input.labelIds.map((lid) => ({ task_id: data.id, label_id: lid }))
      );
    }

    // Log activity
    await supabase.from("activity_log").insert({
      task_id: data.id,
      user_id: user.id,
      type: "created",
      payload: { title: input.title },
    });

    await fetchTasks();
    return data;
  }, [tasks, fetchTasks]);

  const updateTask = useCallback(async (
    taskId: string,
    updates: Partial<Pick<Task, "title" | "description" | "status" | "priority" | "due_date" | "position">>,
    labelIds?: string[]
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const original = tasks.find((t) => t.id === taskId);

    const { error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId);

    if (error) { setError(error.message); return; }

    // Handle label updates
    if (labelIds !== undefined) {
      await supabase.from("task_labels").delete().eq("task_id", taskId);
      if (labelIds.length > 0) {
        await supabase.from("task_labels").insert(
          labelIds.map((lid) => ({ task_id: taskId, label_id: lid }))
        );
      }
      // Small delay to ensure Supabase has committed the label changes
      // before fetchTasks re-queries with the join
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Log status changes
    if (updates.status && original && updates.status !== original.status) {
      await supabase.from("activity_log").insert({
        task_id: taskId,
        user_id: user.id,
        type: "status_change",
        payload: { from: original.status, to: updates.status },
      });
    }

    // Log priority changes
    if (updates.priority && original && updates.priority !== original.priority) {
      await supabase.from("activity_log").insert({
        task_id: taskId,
        user_id: user.id,
        type: "priority_change",
        payload: { from: original.priority, to: updates.priority },
      });
    }

    await fetchTasks();
  }, [tasks, fetchTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) { setError(error.message); return; }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const moveTask = useCallback(async (taskId: string, newStatus: Status) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t)
    );

    const { data: { user } } = await supabase.auth.getUser();
    const original = tasks.find((t) => t.id === taskId);

    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);

    if (original && original.status !== newStatus && user) {
      await supabase.from("activity_log").insert({
        task_id: taskId,
        user_id: user.id,
        type: "status_change",
        payload: { from: original.status, to: newStatus },
      });
    }
  }, [tasks]);

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, moveTask };
}
