"use client";

import { Button } from "../ui/button";
import { Play } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useState } from "react";

export function PublishButton({
  onClick,
  isRepublish = false,
}: {
  onClick: () => void;
  isRepublish?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full" size="sm" variant="default">
          <Play className="w-4 h-4 mr-1"></Play>
          {isRepublish ? "再公開する" : "公開する"}
        </Button>
      </AlertDialogTrigger>
      {isOpen && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRepublish
                ? "イベントを再公開しますか？"
                : "イベントを公開しますか？"}
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col space-y-3">
              {!isRepublish && (
                <span className="text-red-500">
                  一度イベントを公開すると、イベント対象のカテゴリ・アクションおよびチーム・ユーザーが固定され変更できなくなります。
                </span>
              )}
              <span>
                イベントを公開すると、対象チームのユーザーのデイリーレコード画面にこのイベントが表示されます。ほかに進行中のイベントがあっても、同時に進行できます。
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>やっぱりやめる</AlertDialogCancel>
            <AlertDialogAction onClick={onClick}>公開する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
