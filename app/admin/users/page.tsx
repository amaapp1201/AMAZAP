import { auth } from "@/features/helpers/auth";
import { getTeams } from "@/features/team-page/team-service";
import { UserHome } from "@/features/user-page/user-home";
import {
  createUser,
  deleteUser,
  getUserRecordCount,
  getUsers,
  updateUser,
  updateUserPassword,
} from "@/features/user-page/user-service";

const pageSize = 50;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string; // nextjsではstring型で渡される
    searchTerm?: string;
    archived?: string; // "1" のときアーカイブ中の一覧を表示する
  }>;
}) {
  const { page, searchTerm, archived } = await searchParams;
  const isArchivedView = archived === "1";
  const currentPage = page ? Number(page) : 1;

  const decodedSearchTerm = searchTerm
    ? decodeURIComponent(searchTerm)
    : undefined;

  const { users, count } = await getUsers({
    page: currentPage,
    pageSize: pageSize,
    searchTerm: decodedSearchTerm,
    archived: isArchivedView,
  });

  const { teams } = await getTeams({
    pageSize: 1000,
  });

  const session = await auth();

  const totalPages = Math.ceil(count / pageSize);
  return (
    <UserHome
      currentPage={currentPage}
      totalPages={totalPages}
      users={users}
      searchTerm={decodedSearchTerm}
      updateUser={updateUser}
      updateUserPassword={updateUserPassword}
      deleteUser={deleteUser}
      getUserRecordCount={getUserRecordCount}
      currentUserId={session?.user.id ?? ""}
      isArchivedView={isArchivedView}
      createNewUser={createUser}
      pageSize={pageSize}
      teams={teams}
      total={count}
      count={users.length}
    ></UserHome>
  );
}
