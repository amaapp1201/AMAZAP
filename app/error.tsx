"use client"; // Error boundaries must be Client Components

import { useCallback, useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  // リロード関数を useCallback でメモ化
  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div>
      <h2>何かしらのエラーが発生しました</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => handleReload
        }
      >
        リロード
      </button>
    </div>
  );
}
