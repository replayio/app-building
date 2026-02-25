import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchAllTasks, fetchTaskClients, fetchTaskUsers } from "../tasksSlice";
import type { Task, TaskClient, TaskUser, TaskDeal } from "../tasksSlice";
import { TasksListHeader } from "../components/TasksListHeader";
import { TasksFilter } from "../components/TasksFilter";
import { TaskCardList } from "../components/TaskCardList";
import { CreateTaskModal } from "../components/CreateTaskModal";

interface TasksSliceState {
  items: Task[];
  clients: TaskClient[];
  users: TaskUser[];
  clientDeals: TaskDeal[];
  loading: boolean;
  error: string | null;
}

function selectTasks(state: RootState) {
  return (state as unknown as { tasks: TasksSliceState }).tasks;
}

export function TasksListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: tasks, clients, users, clientDeals, loading } = useSelector(selectTasks);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");

  useEffect(() => {
    dispatch(fetchAllTasks());
    dispatch(fetchTaskClients());
    dispatch(fetchTaskUsers());
  }, [dispatch]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const assigneeOptions = useMemo(() => {
    return users.map((u) => ({ value: u.id, label: u.name }));
  }, [users]);

  const clientOptions = useMemo(() => {
    return clients.map((c) => ({ value: c.id, label: c.name }));
  }, [clients]);

  const filtered = useMemo(() => {
    // Only show open/pending tasks (upcoming tasks - not completed or canceled)
    let result = tasks.filter((t) => t.status !== "completed" && t.status !== "canceled");

    // Text search by title
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    // Priority filter
    if (priorityFilter) {
      result = result.filter((t) => t.priority.toLowerCase() === priorityFilter.toLowerCase());
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Assignee filter
    if (assigneeFilter) {
      result = result.filter((t) => t.assigneeId === assigneeFilter);
    }

    // Client filter
    if (clientFilter) {
      result = result.filter((t) => t.clientId === clientFilter);
    }

    // Sort by due date (soonest first), nulls last
    result = [...result].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

    return result;
  }, [tasks, debouncedSearch, priorityFilter, statusFilter, assigneeFilter, clientFilter]);

  if (loading && tasks.length === 0) {
    return (
      <div className="tasks-page p-6 max-sm:p-3" data-testid="tasks-list-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Upcoming Tasks</h1>
          </div>
        </div>
        <div className="tasks-loading">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="tasks-page p-6 max-sm:p-3" data-testid="tasks-list-page">
      <TasksListHeader onCreateTask={() => setCreateModalOpen(true)} />

      <TasksFilter
        search={search}
        onSearchChange={handleSearchChange}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        clientFilter={clientFilter}
        onClientFilterChange={setClientFilter}
        assigneeOptions={assigneeOptions}
        clientOptions={clientOptions}
      />

      <TaskCardList tasks={filtered} />

      <CreateTaskModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        clients={clients}
        users={users}
        clientDeals={clientDeals}
      />
    </div>
  );
}
