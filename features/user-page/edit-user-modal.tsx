"use client";
import { Pencil2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { LocalShcmeaType, UserForm } from "./user-form";

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

export function EditUserModal({
  teams,
  updateUser,
  user,
}: {
  teams: {
    id: number;
    name: string;
  }[];
  updateUser: (data: {
    userId: string;
    teamId: number | null;
    name: string;
    password?: string;
    isAdmin: boolean;
  }) => Promise<any>;
  user: {
    userId: string;
    name: string;
    teamId: number | null;
    isAdmin: boolean;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const onSubmit = useCallback((data: LocalShcmeaType) => {
    return updateUser({
      ...data,
      teamId: data.teamId ?? null,
      userId: user.userId,
    })
      .then(() => {
        setIsOpen(false);
        router.refresh();
        toast("ユーザー情報を更新しました");
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
          ユーザーを編集
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>ユーザーを編集</DialogTitle>
        </DialogHeader>
        <UserForm
          existingUser={user}
          onDismiss={() => setIsOpen(false)}
          onSubmit={onSubmit}
          teams={teams}
          Footer={DialogFooter}
          flow="edit"
        ></UserForm>
      </DialogContent>
    </Dialog>
  );
}
