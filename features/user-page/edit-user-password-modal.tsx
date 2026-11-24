"use client";

import { LockClosedIcon } from "@radix-ui/react-icons";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

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
import { UserPasswordForm, LocalShcmeaType } from "./user-password-form";

export function EditUserPasswordModal({
  updateUserPassword,
  user,
}: {
  updateUserPassword: (data: {
    userId: string;
    password: string;
  }) => Promise<any>;
  user: {
    userId: string;
    name: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const onSubmit = useCallback((data: LocalShcmeaType) => {
    return updateUserPassword({
      ...data,
      userId: user.userId,
    })
      .then(() => {
        setIsOpen(false);
        router.refresh();
        toast("パスワードを変更しました");
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
          <LockClosedIcon className="h-4 w-4 mr-1"></LockClosedIcon>
          パスワードを変更
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{user.name}のパスワードを変更</DialogTitle>
        </DialogHeader>
        <UserPasswordForm
          onDismiss={() => setIsOpen(false)}
          onSubmit={onSubmit}
          Footer={DialogFooter}
        ></UserPasswordForm>
      </DialogContent>
    </Dialog>
  );
}
