"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { generateBuildSteps, serializeMeta } from "@/lib/generate-build-steps";

/*
  Profiles table: also needs these columns (add via Supabase migration):
  ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS building_type TEXT,
    ADD COLUMN IF NOT EXISTS experience_level TEXT,
    ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT false;
*/

export async function onboardAndCreate(_prevState: { error: string } | null, formData: FormData): Promise<{ error: string } | never> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const buildingType = String(formData.get("building_type") ?? "").trim();
  const experienceLevel = String(formData.get("experience_level") ?? "").trim();
  const idea = String(formData.get("idea") ?? "").trim();

  if (!idea || idea.length < 20) {
    return { error: "Give us a bit more detail — at least 20 characters so Claude can do its job." };
  }

  // Save profile answers (best-effort)
  try {
    await supabase.from("profiles").upsert({
      id: user.id,
      building_type: buildingType || null,
      experience_level: experienceLevel || null,
      onboarding_done: true,
    });
  } catch { /* non-critical */ }

  // Generate project
  let plan;
  try {
    plan = await generateBuildSteps(idea);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate steps. Please try again." };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({ title: plan.title, raw_idea: idea, user_id: user.id })
    .select("id")
    .single();

  if (projectError || !project) {
    return { error: "Failed to save project. Please try again." };
  }

  const stepsToInsert = plan.steps.map((s, i) => ({
    project_id: project.id,
    step_index: i,
    title: s.title,
    phase: s.phase,
    objective: s.objective,
    guidance: s.guidance,
    ai_output: i === 0 ? serializeMeta(plan) : null,
    status: "pending",
  }));

  await supabase.from("build_steps").insert(stepsToInsert);

  redirect(`/project/${project.id}`);
}
