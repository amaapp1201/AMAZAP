"use client";

import { TrashIcon } from "lucide-react";
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
} from "./alert-dialog";
import { Button } from "./button";
import { useState } from "react";

export function DeleteWithAlert({
  onDeleteContinue,
  buttonTitle,
  title,
  description,
  continueTitle,
}: {
  onDeleteContinue: () => void;
  buttonTitle?: string;
  title?: string;
  description?: string;
  continueTitle?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className="h-8 w-full" variant="destructive">
          <TrashIcon className="h-4 w-4 mr-1"></TrashIcon>
          {buttonTitle ?? "削除する"}
        </Button>
      </AlertDialogTrigger>
      {isOpen && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {title ?? "本当に削除しますか？"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {description ?? "一度削除すると元に戻すことはできません。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>やっぱりやめる</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteContinue}>
              {continueTitle ?? "削除する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
