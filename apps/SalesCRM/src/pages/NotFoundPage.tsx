import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
      <h1 className="text-[32px] font-semibold text-text-primary">404</h1>
      <p className="text-text-muted mt-2 mb-4">Page not found</p>
      <Link
        to="/clients"
        className="text-accent hover:text-accent-blue transition-colors"
      >
        Go to Clients
      </Link>
    </div>
  )
}
