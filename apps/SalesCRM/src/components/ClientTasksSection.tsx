import { useEffect, useState } from 'react'

interface ClientTask {
  id: string
  title: string
  due_date: string | null
  priority: string
  deal_name: string | null
  completed: boolean
}

export default function ClientTasksSection({ clientId }: { clientId: string }) {
  const [tasks, setTasks] = useState<ClientTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/.netlify/functions/tasks?client_id=${clientId}`)
      .then(r => r.json())
      .then(data => {
        setTasks(data.tasks || [])
        setLoading(false)
      })
  }, [clientId])

  if (loading) {
    return (
      <section data-testid="client-tasks-section">
        <h2>Tasks</h2>
        <p>Loading tasks...</p>
      </section>
    )
  }

  return (
    <section data-testid="client-tasks-section">
      <h2>Tasks</h2>
      {tasks.length === 0 ? (
        <p data-testid="client-tasks-empty">No tasks for this client.</p>
      ) : (
        <div data-testid="client-tasks-list">
          {tasks.map(task => (
            <div key={task.id} data-testid={`client-task-${task.id}`}>
              <span>{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
