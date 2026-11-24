"use client";
import { useRouter } from "next/navigation";

const ErrorPage = () => {
  const router = useRouter();

  return (
    <div>
      <h1>Error Page</h1>
      <p>エラーが発生しました。</p>
      <button onClick={() => router.push("/")}>ホームに戻る</button>
    </div>
  );
};

export default ErrorPage;
