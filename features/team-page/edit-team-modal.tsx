"use client";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "@/features/helpers/ja-zod";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { TeamForm } from "./team-form";

const LocalShcmea = z.object({
  name: z.string().trim().min(1).max(25),
});
type LocalShcmeaType = z.infer<typeof LocalShcmea>;

export function EditTeamModal({
  updateTeam,
  team,
}: {
  updateTeam: (data: { teamId: number; name: string }) => Promise<any>;
  team: {
    name: string;
    teamId: number;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const onSubmit = useCallback((data: LocalShcmeaType) => {
    return updateTeam({
      ...data,
      teamId: team.teamId,
    })
      .then(() => {
        setIsOpen(false);
        router.refresh();
        toast("チーム情報を更新しました");
      })
      .catch((e) => {
        toast("エラーが発生しました", {
          description: e.message,
        });
      });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 w-full">
          <Pencil2Icon className="h-4 w-4 mr-1"></Pencil2Icon>
          チームを編集
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>チームを編集</DialogTitle>
        </DialogHeader>
        <TeamForm
          onSubmit={onSubmit}
          onDismiss={() => setIsOpen(false)}
          Footer={DialogFooter}
          existingTeam={team}
          flow="edit"
        ></TeamForm>
      </DialogContent>
    </Dialog>
  );
}
