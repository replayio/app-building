import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchTaskDetail,
  fetchTaskNotes,
  fetchTaskDetailUsers,
  clearTaskDetail,
} from "../taskDetailSlice";
import { TaskDetailHeader } from "../components/TaskDetailHeader";
import { TaskNotesSection } from "../components/TaskNotesSection";
import { TaskActions } from "../components/TaskActions";

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const dispatch = useAppDispatch();

  const { task, notes, users, loading, error } = useAppSelector(
    (state) => state.taskDetail
  );

  useEffect(() => {
    if (!taskId) return;

    dispatch(fetchTaskDetail(taskId));
    dispatch(fetchTaskNotes(taskId));
    dispatch(fetchTaskDetailUsers());

    return () => {
      dispatch(clearTaskDetail());
    };
  }, [taskId, dispatch]);

  if (loading && !task) {
    return (
      <div data-testid="task-detail-page" className="task-detail-page p-6 max-sm:p-3">
        <div className="task-detail-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="task-detail-page" className="task-detail-page p-6 max-sm:p-3">
        <div className="task-detail-error">{error}</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div data-testid="task-detail-page" className="task-detail-page p-6 max-sm:p-3">
        <div className="task-detail-error">Task not found</div>
      </div>
    );
  }

  return (
    <div data-testid="task-detail-page" className="task-detail-page p-6 max-sm:p-3">
      <TaskDetailHeader task={task} users={users} />
      <TaskActions taskId={task.id} status={task.status} />
      <TaskNotesSection taskId={task.id} notes={notes} />
    </div>
  );
}
