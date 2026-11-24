"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/features/ui/button";

export function LogoutButton() {
  return <Button onClick={() => signOut()}>ログアウト</Button>;
}
