"use client";

import { Button } from "@/features/ui/button";
import { signOut } from "next-auth/react";

export function LogoutButtion() {
  return <Button onClick={() => signOut()}>ログアウト</Button>;
}
