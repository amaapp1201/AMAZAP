"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useCallback, useState } from "react";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LocalShcmeaType, UserForm } from "./user-form";

export function NewUserModal({
  teamId,
  teams,
  createNewUser,
}: {
  teamId?: number;
  teams: {
    id: number;
    name: string;
  }[];
  createNewUser: (data: {
    teamId: number | null;
    name: string;
    password: string;
    isAdmin: boolean;
  }) => Promise<{ failure: string } | void>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const onSubmit = useCallback((data: LocalShcmeaType) => {
    if (data.password === undefined) {
      throw new Error("パスワードを入力してください");
    }
    return createNewUser(data as any)
      .then((result) => {
        if (result) {
          toast.error(result.failure);
          return;
        }
        setIsOpen(false);
        router.refresh();
        toast("ユーザーを追加しました");
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
          ユーザーを追加
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>ユーザーを追加</DialogTitle>
        </DialogHeader>
        <UserForm
          teamId={teamId}
          onDismiss={() => setIsOpen(false)}
          onSubmit={onSubmit}
          teams={teams}
          Footer={DialogFooter}
          flow="create"
        ></UserForm>
      </DialogContent>
    </Dialog>
  );
}
