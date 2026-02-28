import type { ContainerInfo } from '../store/statusSlice'
import './ActiveContainers.css'

interface ActiveContainersProps {
  containers: ContainerInfo[]
}

function ActiveContainers({ containers }: ActiveContainersProps) {
  return (
    <div className="active-containers" data-testid="active-containers">
      <h2 className="active-containers__title">Active Containers</h2>
      {containers.length === 0 ? (
        <p className="active-containers__empty" data-testid="active-containers-empty">
          No active containers
        </p>
      ) : (
        <div className="active-containers__table-wrapper">
          <table className="active-containers__table" data-testid="active-containers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Prompt</th>
                <th>Last Event</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((container) => (
                <tr key={container.container_id} data-testid="active-container-row">
                  <td className="active-containers__name" data-testid="container-name">
                    {container.name}
                  </td>
                  <td data-testid="container-status">
                    <span className={`active-containers__status active-containers__status--${container.status}`}>
                      {container.status}
                    </span>
                  </td>
                  <td className="active-containers__prompt" data-testid="container-prompt">
                    {container.prompt || '—'}
                  </td>
                  <td className="active-containers__time" data-testid="container-last-event">
                    {new Date(container.last_event_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ActiveContainers
