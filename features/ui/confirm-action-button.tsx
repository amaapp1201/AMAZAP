"use client";

import { ReactNode, useEffect, useState } from "react";
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
} from "./alert-dialog";
import { Button, ButtonProps } from "./button";

// 確認ダイアログを挟んでからサーバーの処理を実行するボタン。
// 削除、アーカイブ、元に戻す、の各操作で共通して使う
export function ConfirmActionButton({
  label,
  icon,
  variant = "outline",
  title,
  description,
  loadDescription,
  confirmLabel,
  successMessage,
  onConfirm,
  disabledReason,
  className = "h-8 w-full",
}: {
  label: string;
  icon?: ReactNode;
  variant?: ButtonProps["variant"];
  title: string;
  description?: string;
  // 件数など、開いたときにサーバーへ問い合わせて作る説明文。指定すると description より優先される
  loadDescription?: () => Promise<string>;
  confirmLabel: string;
  successMessage: string;
  // failure を返すと、その文言を表示してダイアログを閉じる
  onConfirm: () => Promise<{ failure: string } | void>;
  // 実行できない理由。指定するとボタンを押せなくする
  disabledReason?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [loadedDescription, setLoadedDescription] = useState<string | null>(
    null
  );

  const router = useRouter();

  const needsLoading = !!loadDescription;

  // 開くたびに説明文を取り直す
  useEffect(() => {
    if (!isOpen || !loadDescription) {
      return;
    }

    let isCancelled = false;
    setLoadedDescription(null);
    loadDescription()
      .then((text) => {
        if (!isCancelled) {
          setLoadedDescription(text);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setIsOpen(false);
          toast("エラーが発生しました", {
            description: "内容を確認できませんでした",
          });
        }
      });

    return () => {
      isCancelled = true;
    };
    // loadDescription は描画のたびに作り直されるので、開閉だけをきっかけにする
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onClick = () => {
    setIsPending(true);
    onConfirm()
      .then((result) => {
        setIsOpen(false);
        if (result?.failure) {
          toast("実行できませんでした", {
            description: result.failure,
          });
          return;
        }
        router.refresh();
        toast(successMessage);
      })
      .catch(() => {
        toast("エラーが発生しました", {
          description: "処理を完了できませんでした。もう一度お試しください",
        });
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  const isLoadingDescription = needsLoading && loadedDescription === null;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        // 処理の途中では閉じさせない
        if (!isPending) {
          setIsOpen(open);
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          className={className}
          variant={variant}
          disabled={!!disabledReason}
          title={disabledReason}
        >
          {icon}
          {label}
        </Button>
      </AlertDialogTrigger>
      {isOpen && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {isLoadingDescription
                ? "内容を確認しています…"
                : loadedDescription ?? description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              やっぱりやめる
            </AlertDialogCancel>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={onClick}
              disabled={isLoadingDescription || isPending}
            >
              {isPending ? "処理中…" : confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}

// サーバーの処理の戻り値の型
export type ActionResult = Promise<{ failure: string } | void>;
