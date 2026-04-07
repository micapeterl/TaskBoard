"use client";
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Comment, ActivityEntry } from "@/types";

export function useTaskDetail(taskId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!taskId) return;
    setLoadingDetail(true);

    const [{ data: cmts }, { data: acts }] = await Promise.all([
      supabase
        .from("comments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true }),
      supabase
        .from("activity_log")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    setComments(cmts ?? []);
    setActivity(acts ?? []);
    setLoadingDetail(false);
  }, [taskId]);

  const addComment = useCallback(async (body: string) => {
    if (!taskId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("comments").insert({ task_id: taskId, user_id: user.id, body });
    await supabase.from("activity_log").insert({
      task_id: taskId,
      user_id: user.id,
      type: "comment",
      payload: { preview: body.slice(0, 60) },
    });
    await fetchDetail();
  }, [taskId, fetchDetail]);

  return { comments, activity, loadingDetail, fetchDetail, addComment };
}
