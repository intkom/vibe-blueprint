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
    revalidatePath(`/project/${projectId}`);
    revalidatePath("/dashboard");
  }
}
