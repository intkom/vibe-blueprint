"use client";

import { useState } from "react";
import { UsageIndicator } from "@/components/usage-indicator";
import { UpgradeModal } from "@/components/upgrade-modal";

interface UsageIndicatorClientProps {
  used: number;
  limit: number;
}

export function UsageIndicatorClient({ used, limit }: UsageIndicatorClientProps) {
  const [showModal, setShowModal] = useState(false);

  if (used === 0 && limit === 3) return null; // default fresh user — hide widget

  return (
    <>
      <UsageIndicator used={used} limit={limit} onUpgrade={() => setShowModal(true)} />
      {showModal && (
        <UpgradeModal onClose={() => setShowModal(false)} used={used} limit={limit} />
      )}
    </>
  );
}
