"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateBuildSteps } from "@/lib/generate-build-steps";

export type CreateProjectState = { error: string | null };

export async function createProject(
  _prev: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const raw_idea = String(formData.get("idea") ?? "").trim();

  if (!raw_idea) {
    return { error: "Describe your idea." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to save a project." };
  }

  let plan;
  try {
    plan = await generateBuildSteps(raw_idea);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate steps.";
    return { error: msg };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      title: plan.title,
      raw_idea,
      user_id: user.id,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    return { error: projectError?.message ?? "Failed to save project." };
  }

  const steps = plan.steps.map((s, i) => ({
    project_id: project.id,
    step_index: i,
    phase: s.phase,
    title: s.title,
    objective: s.objective,
    guidance: s.guidance,
    ai_output: s.guidance,
  }));

  const { error: stepsError } = await supabase.from("build_steps").insert(steps);

  if (stepsError) {
    return { error: stepsError.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
