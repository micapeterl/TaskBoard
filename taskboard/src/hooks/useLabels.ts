"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Label } from "@/types";

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);

  const fetchLabels = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("labels")
      .select("*")
      .eq("user_id", user.id)
      .order("name");
    setLabels(data ?? []);
  }, []);

  useEffect(() => { fetchLabels(); }, [fetchLabels]);

  const createLabel = useCallback(async (name: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("labels")
      .insert({ user_id: user.id, name, color })
      .select()
      .single();
    await fetchLabels();
    return data;
  }, [fetchLabels]);

  const deleteLabel = useCallback(async (id: string) => {
    await supabase.from("labels").delete().eq("id", id);
    setLabels((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { labels, fetchLabels, createLabel, deleteLabel };
}
