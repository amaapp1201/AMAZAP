"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { z } from "@/features/helpers/ja-zod";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";

import { TeamForm } from "./team-form";

const LocalShcmea = z.object({
  name: z.string().trim().min(1),
});
type LocalShcmeaType = z.infer<typeof LocalShcmea>;

export function NewTeamModal({
  createNewTeam,
}: {
  createNewTeam: (data: LocalShcmeaType) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const onSubmit = useCallback((data: LocalShcmeaType) => {
    return createNewTeam(data)
      .then(() => {
        setIsOpen(false);
        router.refresh();
        toast("チームを作成しました");
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
        <Button variant="outline" className="h-8">
          <PlusIcon className="h-4 w-4 mr-1"></PlusIcon>
          チームを追加
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>チームを追加</DialogTitle>
        </DialogHeader>
        <TeamForm
          onSubmit={onSubmit}
          onDismiss={() => setIsOpen(false)}
          Footer={DialogFooter}
          flow="create"
        ></TeamForm>
      </DialogContent>
    </Dialog>
  );
}
