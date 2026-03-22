export type AchievementId =
  | "first_step"
  | "halfway"
  | "shipped"
  | "speed_builder";

export type Achievement = {
  id: AchievementId;
  emoji: string;
  title: string;
  description: string;
  color: string;
};

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  first_step: {
    id: "first_step",
    emoji: "🎯",
    title: "First Step!",
    description: "You completed your first build step.",
    color: "#a78bfa",
  },
  halfway: {
    id: "halfway",
    emoji: "⚡",
    title: "Halfway There!",
    description: "You've completed 5 steps. Keep pushing!",
    color: "#fbbf24",
  },
  shipped: {
    id: "shipped",
    emoji: "🚀",
    title: "Shipped!",
    description: "You completed all steps. You built something real.",
    color: "#34d399",
  },
  speed_builder: {
    id: "speed_builder",
    emoji: "🔥",
    title: "Speed Builder!",
    description: "You completed 3 steps in a single day.",
    color: "#fb923c",
  },
};

const STORAGE_KEY = "vibestep_achievements";
const SPEED_KEY   = "vibestep_steps_today";

export function getUnlockedAchievements(): AchievementId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AchievementId[]) : [];
  } catch {
    return [];
  }
}

function saveUnlocked(ids: AchievementId[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
}

/** Returns newly unlocked achievements (not yet stored). */
export function checkAchievements(opts: {
  totalSteps: number;
  completedSoFar: number; // count including the new one
}): Achievement[] {
  const { totalSteps, completedSoFar } = opts;
  const unlocked = getUnlockedAchievements();
  const toUnlock: AchievementId[] = [];

  if (!unlocked.includes("first_step") && completedSoFar >= 1) {
    toUnlock.push("first_step");
  }
  if (!unlocked.includes("halfway") && completedSoFar >= Math.ceil(totalSteps / 2) && totalSteps > 1) {
    toUnlock.push("halfway");
  }
  if (!unlocked.includes("shipped") && completedSoFar >= totalSteps && totalSteps > 0) {
    toUnlock.push("shipped");
  }

  // Speed builder: track steps completed today
  if (!unlocked.includes("speed_builder")) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const raw = localStorage.getItem(SPEED_KEY);
      const rec: { date: string; count: number } = raw
        ? JSON.parse(raw)
        : { date: today, count: 0 };

      const updated = rec.date === today
        ? { date: today, count: rec.count + 1 }
        : { date: today, count: 1 };

      localStorage.setItem(SPEED_KEY, JSON.stringify(updated));

      if (updated.count >= 3) toUnlock.push("speed_builder");
    } catch { /* ignore */ }
  }

  if (toUnlock.length > 0) {
    saveUnlocked([...unlocked, ...toUnlock]);
  }

  return toUnlock.map(id => ACHIEVEMENTS[id]);
}
