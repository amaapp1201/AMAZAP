"use client";

import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { TabButton } from "@/ui/tab-button";

export function EventTabMenu() {
  const router = useRouter();
  const currentSegment = useSelectedLayoutSegment();

  return (
    <TabButton
      buttons={[
        {
          label: "現在進行中",
          onClick: () => {
            if (currentSegment === "current") return;
            router.push(`/admin/events/current`);
          },
          defaultIsActive: "current" === currentSegment,
        },
        {
          label: "計画中",
          onClick: () => {
            if (currentSegment === "plan") return;
            router.push(`/admin/events/plan`);
          },
          defaultIsActive: "plan" === currentSegment,
        },
        {
          label: "アーカイブ",
          onClick: () => {
            if (currentSegment === "past") return;
            router.push(`/admin/events/past`);
          },
          defaultIsActive: "past" === currentSegment,
        },
      ]}
    ></TabButton>
  );
}
