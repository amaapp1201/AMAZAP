import { LoaderCircle } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoaderCircle className="animate-spin h-16 w-16 "></LoaderCircle>
    </div>
  );
}
