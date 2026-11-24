import { UserTable } from "./user-table";
import { SmartPagination } from "../ui/smart-pagination";
import { SearchQueryBar } from "./search-query-bar";
import { NewUserModal } from "./new-user-modal";
import { PaginationInfo } from "../ui/pagination-info";

export function UserHome({
  users,
  teams,
  updateUser,
  updateUserPassword,
  deleteUser,
  getUserRecordCount,
  currentUserId,
  createNewUser,
  currentPage,
  totalPages,
  searchTerm,
  total,
  count,
  pageSize,
}: {
  users: {
    user_id: string | null;
    user_name: string | null;
    is_admin: boolean | null;
    team_id: number | null;
    team_name: string | null;
  }[];
  updateUser: (data: {
    userId: string;
    teamId: number | null;
    name: string;
    isAdmin: boolean;
  }) => Promise<any>;
  updateUserPassword: (data: {
    userId: string;
    password: string;
  }) => Promise<any>;
  deleteUser: (userId: string) => Promise<{ failure: string } | void>;
  getUserRecordCount: (userId: string) => Promise<number>;
  currentUserId: string;
  createNewUser: (data: {
    teamId: number | null;
    name: string;
    password: string;
    isAdmin: boolean;
  }) => Promise<{ failure: string } | void>;
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
}) {
  return (
    <div className="flex flex-col space-y-2 p-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold">ユーザー一覧</h2>
        <NewUserModal
          teams={teams}
          createNewUser={createNewUser}
        ></NewUserModal>
      </div>
      <div className="grid grid-cols-[auto_max-content] gap-4 items-center">
        <SearchQueryBar defaultSearchTerm={searchTerm}></SearchQueryBar>
        <PaginationInfo
          total={total}
          start={(currentPage - 1) * pageSize + 1}
          end={(currentPage - 1) * pageSize + count}
        ></PaginationInfo>
      </div>
      {users.length === 0 ? (
        <div>ユーザーが見つかりませんでした</div>
      ) : (
        <UserTable
          users={users}
          teams={teams}
          updateUser={updateUser}
          updateUserPassword={updateUserPassword}
          deleteUser={deleteUser}
          getUserRecordCount={getUserRecordCount}
          currentUserId={currentUserId}
        ></UserTable>
      )}

      <SmartPagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseHref="/admin/users"
      ></SmartPagination>
    </div>
  );
}
