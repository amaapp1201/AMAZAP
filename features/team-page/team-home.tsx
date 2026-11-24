import { SmartPagination } from "../ui/smart-pagination";
import { NewTeamModal } from "./new-team-modal";
import { SearchQueryBar } from "../user-page/search-query-bar";
import { TeamTable } from "./team-table";
import { PaginationInfo } from "../ui/pagination-info";

export function TeamHome({
  teams,
  createNewTeam,
  updateTeam,
  currentPage,
  totalPages,
  searchTerm,
  total,
  count,
  pageSize,
}: {
  createNewTeam: (data: { name: string }) => Promise<void>;
  updateTeam: (data: { teamId: number; name: string }) => Promise<any>;
  teams: {
    id: number;
    name: string;
  }[];
  currentPage: number;
  totalPages: number;
  count: number;
  total: number;
  pageSize: number;
  searchTerm?: string;
  totalCount: number;
}) {
  return (
    <div className="flex flex-col space-y-2 p-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold">チーム一覧</h2>
        <NewTeamModal createNewTeam={createNewTeam}></NewTeamModal>
      </div>
      <div className="grid grid-cols-[auto_max-content] gap-4 items-center">
        <SearchQueryBar
          defaultSearchTerm={searchTerm}
          placeholder="チーム名..."
        ></SearchQueryBar>
        <PaginationInfo
          total={total}
          start={(currentPage - 1) * pageSize + 1}
          end={(currentPage - 1) * pageSize + count}
        ></PaginationInfo>
      </div>
      {teams.length === 0 ? (
        <div>チームが見つかりませんでした</div>
      ) : (
        <TeamTable teams={teams} updateTeam={updateTeam}></TeamTable>
      )}
      <SmartPagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseHref="/admin/teams"
      ></SmartPagination>
    </div>
  );
}
