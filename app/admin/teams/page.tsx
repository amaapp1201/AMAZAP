import { TeamHome } from "@/features/team-page/team-home";
import {
  createTeam,
  getTeams,
  updateTeam,
} from "@/features/team-page/team-service";

const pageSize = 50;

export default async function Page({
  searchParams: { page, searchTerm },
}: {
  searchParams: {
    page?: string; // nextjsではstring型で渡される
    searchTerm?: string;
  };
}) {
  const currentPage = page ? Number(page) : 1;

  const decodedSearchTerm = searchTerm
    ? decodeURIComponent(searchTerm)
    : undefined;

  const { teams, count } = await getTeams({
    page: currentPage,
    pageSize: pageSize,
    searchTerm: decodedSearchTerm,
  });

  const totalPages = Math.ceil(count / pageSize);
  return (
    <TeamHome
      currentPage={currentPage}
      totalPages={totalPages}
      searchTerm={decodedSearchTerm}
      createNewTeam={createTeam}
      updateTeam={updateTeam}
      teams={teams}
      totalCount={totalPages}
      pageSize={pageSize}
      total={count}
      count={teams.length}
    ></TeamHome>
  );
}
