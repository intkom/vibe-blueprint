"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateBuildSteps, serializeMeta } from "@/lib/generate-build-steps";
import { runTool, serializeToolOutput, TOOL_TYPES, type ToolType } from "@/lib/tools";

export type CreateProjectState = { error: string | null };

export async function createProject(
  _prev: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const raw_idea = String(formData.get("idea") ?? "").trim();
  const toolTypeRaw = String(formData.get("tool_type") ?? "sprint").trim();
  const toolType: ToolType = (TOOL_TYPES as readonly string[]).includes(toolTypeRaw)
    ? (toolTypeRaw as ToolType)
    : "sprint";

  if (!raw_idea) {
    return { error: "Describe your idea — even a rough sentence is enough." };
  }
  if (raw_idea.length < 20) {
    return { error: "Give us a bit more detail — at least 20 characters so Claude can do its job." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to save a project." };
  }

  /* ── Sprint tool (existing behaviour — 10 steps) ── */
  if (toolType === "sprint") {
    let plan;
    try {
      plan = await generateBuildSteps(raw_idea);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to generate steps." };
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({ title: plan.title, raw_idea, user_id: user.id })
      .select("id")
      .single();

    if (projectError || !project) {
      return { error: projectError?.message ?? "Failed to save project." };
    }

    const meta = serializeMeta(plan);
    const steps = plan.steps.map((s, i) => ({
      project_id: project.id,
      step_index: i,
      phase: s.phase,
      title: s.title,
      objective: s.objective,
      guidance: s.guidance,
      ai_output: i === 0 ? meta : s.guidance,
    }));

    const { error: stepsError } = await supabase.from("build_steps").insert(steps);
    if (stepsError) return { error: stepsError.message };

    revalidatePath("/dashboard");
    redirect(`/dashboard`);
  }

  /* ── All other tools (single structured output) ── */
  let output;
  try {
    output = await runTool(toolType, raw_idea);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate output." };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({ title: output.title, raw_idea, user_id: user.id })
    .select("id")
    .single();

  if (projectError || !project) {
    return { error: projectError?.message ?? "Failed to save project." };
  }

  // Store the full structured output in step 0's ai_output; phase = tool_type for detection
  const { error: stepError } = await supabase.from("build_steps").insert({
    project_id: project.id,
    step_index: 0,
    phase: toolType,            // used to detect which renderer to show
    title: toolType,
    objective: "",
    guidance: "",
    ai_output: serializeToolOutput(output),
  });

  if (stepError) return { error: stepError.message };

  revalidatePath("/dashboard");
  redirect(`/project/${project.id}`);
}

export async function deleteProject(formData: FormData): Promise<void> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
