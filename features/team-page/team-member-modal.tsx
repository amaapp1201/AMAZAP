"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import useSWR from "swr";
import { Users2Icon } from "lucide-react";
import { TeamUser } from "./team-user";

const fetcher = (...args: [RequestInfo, RequestInit?]) =>
  fetch(...args).then((res) => res.json());

export function TeamMemberModal({ teamId }: { teamId: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 w-full">
          <Users2Icon className="h-4 w-4 mr-1"></Users2Icon>
          チームメンバー閲覧
        </Button>
      </DialogTrigger>
      {isOpen && (
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>チームメンバー閲覧</DialogTitle>
          </DialogHeader>
          <TeamUser teamId={teamId}></TeamUser>
        </DialogContent>
      )}
    </Dialog>
  );
}
