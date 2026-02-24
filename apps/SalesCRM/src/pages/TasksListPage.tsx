import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { fetchTasks } from '@/store/tasksSlice'
import TasksHeader from '@/components/TasksHeader'
import TasksFilter from '@/components/TasksFilter'
import TasksList from '@/components/TasksList'

export default function TasksListPage() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchTasks())
  }, [dispatch])

  return (
    <div className="page-content p-6 max-sm:p-3" data-testid="tasks-list-page">
      <TasksHeader />
      <div className="mb-4">
        <TasksFilter />
      </div>
      <TasksList />
    </div>
  )
}
