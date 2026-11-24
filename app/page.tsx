import { auth } from "@/features/helpers/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.isAdmin) {
    redirect("/admin");
  }

  redirect("/daily-record");
}
