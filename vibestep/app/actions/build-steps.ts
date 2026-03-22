"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function markStepComplete(formData: FormData) {
  const stepId = String(formData.get("stepId") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!stepId || !projectId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("build_steps")
    .update({ status: "complete", completed_at: new Date().toISOString() })
    .eq("id", stepId)
    .eq("project_id", projectId);

  if (!error) {
    // ── Streak update (best-effort) ──────────────────────────────
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak, last_activity_date")
        .eq("id", user.id)
        .single();

      let currentStreak = profile?.current_streak ?? 0;
      const longestStreak = profile?.longest_streak ?? 0;
      const lastDate = profile?.last_activity_date ?? null;

      if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        currentStreak = lastDate === yesterday ? currentStreak + 1 : 1;

        await supabase.from("profiles").upsert({
          id: user.id,
          current_streak: currentStreak,
          longest_streak: Math.max(currentStreak, longestStreak),
          last_activity_date: today,
        });
      }
    } catch {
      // Streak update is non-critical — swallow errors
    }

    revalidatePath(`/project/${projectId}`);
    revalidatePath(`/project/${projectId}/step/${stepId}`);
    revalidatePath("/dashboard");
  }
}
