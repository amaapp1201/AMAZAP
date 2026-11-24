"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "./button";

export function MainNavbar() {
  return (
    <nav className="w-full px-3 flex items-center justify-between bg-emerald-200/50 dark:bg-slate-900 space-x-3">
      <div className="flex space-x-3">
        <span className="font-bold text-slate-700">
          中央会健康促進アプリ_管理者ページ
        </span>
        <Link className="underline" href="/daily-record">
          デイリーレコード画面へ
        </Link>
      </div>

      <div>
        <Button variant="ghost" size="xs" onClick={() => signOut()}>
          ログアウト
        </Button>
      </div>
    </nav>
  );
}
