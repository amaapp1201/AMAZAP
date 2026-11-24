"use client";

import { Button } from "../ui/button";
import { Archive } from "lucide-react";
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

export function ArchiveButton({ onClick }: { onClick: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full" size="sm" variant="destructive">
          <Archive className="w-4 h-4 mr-1"></Archive>
          アーカイブする
        </Button>
      </AlertDialogTrigger>
      {isOpen && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当にアーカイブしますか?</AlertDialogTitle>
            <AlertDialogDescription>
              アーカイブすると、ユーザーのイベントデイリー画面に表示されなくなります。イベントが終わり、ユーザーに今回のイベント内容を表示する必要がなくなった場合に使用してください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>やっぱりやめる</AlertDialogCancel>
            <AlertDialogAction onClick={onClick}>
              アーカイブする
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
