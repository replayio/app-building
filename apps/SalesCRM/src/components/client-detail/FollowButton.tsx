import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthProvider'

interface FollowButtonProps {
  clientId: string
}

export function FollowButton({ clientId }: FollowButtonProps) {
  const { isLoggedIn } = useAuth()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    fetch(`/.netlify/functions/client-follow?clientId=${clientId}`)
      .then(r => r.json())
      .then((data: { following: boolean }) => setFollowing(data.following))
      .catch(() => {})
  }, [clientId, isLoggedIn])

  if (!isLoggedIn) return null

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/client-follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId }),
      })
      if (res.ok) {
        const data = await res.json() as { following: boolean }
        setFollowing(data.following)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      data-testid="client-follow-button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
        following
          ? 'bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20'
          : 'bg-bg-secondary text-text-secondary border border-border hover:bg-bg-tertiary'
      }`}
    >
      {following ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Following
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            <line x1="1" y1="1" x2="23" y2="23" opacity="0.4" />
          </svg>
          Follow
        </>
      )}
    </button>
  )
}
