import { auth } from "./auth";

// サーバー用の鍵（RLS を通らない）を使う処理の前に呼び、
// 呼び出したユーザーが管理者であることを確認する
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    throw new Error("管理者のみが実行できる操作です");
  }

  return session;
}
