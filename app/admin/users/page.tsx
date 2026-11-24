import { getTeams } from "@/features/team-page/team-service";
import { UserHome } from "@/features/user-page/user-home";
import {
  createUser,
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
  }>;
}) {
  const { page, searchTerm } = await searchParams;
  const currentPage = page ? Number(page) : 1;

  const decodedSearchTerm = searchTerm
    ? decodeURIComponent(searchTerm)
    : undefined;

  const { users, count } = await getUsers({
    page: currentPage,
    pageSize: pageSize,
    searchTerm: decodedSearchTerm,
  });

  const { teams } = await getTeams({
    pageSize: 1000,
  });

  const totalPages = Math.ceil(count / pageSize);
  return (
    <UserHome
      currentPage={currentPage}
      totalPages={totalPages}
      users={users}
      searchTerm={decodedSearchTerm}
      updateUser={updateUser}
      updateUserPassword={updateUserPassword}
      createNewUser={createUser}
      pageSize={pageSize}
      teams={teams}
      total={count}
      count={users.length}
    ></UserHome>
  );
}
