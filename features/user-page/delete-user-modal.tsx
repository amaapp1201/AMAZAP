"use client";

import { TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export function DeleteUserModal({
  deleteUser,
  getUserRecordCount,
  user,
  disabledReason,
}: {
  deleteUser: (userId: string) => Promise<{ failure: string } | void>;
  getUserRecordCount: (userId: string) => Promise<number>;
  user: {
    userId: string;
    name: string;
  };
  // 削除できない理由。指定するとボタンを押せなくする
  disabledReason?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // null は件数を確認中
  const [recordCount, setRecordCount] = useState<number | null>(null);

  const router = useRouter();

  // 開くたびに、消えることになる記録の件数を取り直す
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;
    setRecordCount(null);
    getUserRecordCount(user.userId)
      .then((count) => {
        if (!isCancelled) {
          setRecordCount(count);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setIsOpen(false);
          toast("エラーが発生しました", {
            description: "記録の件数を確認できませんでした",
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, user.userId, getUserRecordCount]);

  const onDelete = () => {
    setIsDeleting(true);
    deleteUser(user.userId)
      .then((result) => {
        if (result?.failure) {
          toast("削除できませんでした", {
            description: result.failure,
          });
          return;
        }
        setIsOpen(false);
        router.refresh();
        toast(`${user.name}を削除しました`);
      })
      .catch(() => {
        toast("エラーが発生しました", {
          description: "削除を完了できませんでした。もう一度お試しください",
        });
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        // 削除の途中では閉じさせない
        if (!isDeleting) {
          setIsOpen(open);
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          className="h-8 w-full"
          variant="destructive"
          disabled={!!disabledReason}
          title={disabledReason}
        >
          <TrashIcon className="h-4 w-4 mr-1"></TrashIcon>
          削除
        </Button>
      </AlertDialogTrigger>
      {isOpen && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{user.name}を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {recordCount === null
                ? "記録の件数を確認しています…"
                : recordCount === 0
                ? "このユーザーには記録がありません。一度削除すると元に戻すことはできません。"
                : `このユーザーの記録${recordCount}件も一緒に削除され、過去のイベントを含むランキングや集計から除かれます。一度削除すると元に戻すことはできません。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              やっぱりやめる
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={recordCount === null || isDeleting}
            >
              {isDeleting ? "削除中…" : "削除する"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
