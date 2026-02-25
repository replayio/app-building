import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchUserDetail, clearUserDetail } from "../userDetailSlice";
import { UserHeader } from "../components/UserHeader";
import { UserStats } from "../components/UserStats";
import { OwnedDealsList } from "../components/OwnedDealsList";
import { AssignedTasksList } from "../components/AssignedTasksList";
import { RecentActivityFeed } from "../components/RecentActivityFeed";

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useAppDispatch();
  const { user, deals, tasks, activity, loading, error } = useAppSelector(
    (state) => state.userDetail
  );

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchUserDetail(userId));

    return () => {
      dispatch(clearUserDetail());
    };
  }, [dispatch, userId]);

  if (loading) {
    return (
      <div data-testid="user-detail-page" className="p-6 max-sm:p-3">
        <div className="users-loading">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div data-testid="user-detail-page" className="p-6 max-sm:p-3">
        <div className="user-card-grid-empty">{error || "User not found"}</div>
      </div>
    );
  }

  return (
    <div data-testid="user-detail-page" className="p-6 max-sm:p-3">
      <div className="user-detail">
        <UserHeader user={user} />
        <UserStats user={user} />
        <div className="user-detail-sections">
          <OwnedDealsList deals={deals} />
          <AssignedTasksList tasks={tasks} />
        </div>
        <RecentActivityFeed activity={activity} />
      </div>
    </div>
  );
}
