import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchUsers } from "../usersSlice";
import type { User } from "../usersSlice";
import { TeamHeader } from "../components/TeamHeader";
import { UserCardGrid } from "../components/UserCardGrid";

interface UsersState {
  items: User[];
  loading: boolean;
  error: string | null;
}

function selectUsers(state: RootState) {
  return (state as unknown as { users: UsersState }).users;
}

export function UsersListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: users, loading } = useSelector(selectUsers);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading && users.length === 0) {
    return (
      <div className="users-page p-6 max-sm:p-3" data-testid="users-list-page">
        <div className="page-header">
          <h1 className="page-title">Team</h1>
        </div>
        <div className="users-loading" data-testid="users-loading">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="users-page p-6 max-sm:p-3" data-testid="users-list-page">
      <TeamHeader />
      <UserCardGrid users={users} />
    </div>
  );
}
