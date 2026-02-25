import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@shared/auth/useAuth";

interface FollowButtonProps {
  clientId: string;
}

export function FollowButton({ clientId }: FollowButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const getToken = useCallback((): string | null => {
    return localStorage.getItem("auth_token");
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = getToken();
    if (!token) return;

    fetch(`/.netlify/functions/client-follow?clientId=${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((resp) => resp.json())
      .then((data: { following: boolean }) => {
        setFollowing(data.following);
      })
      .catch(() => {
        // silently fail
      });
  }, [clientId, isAuthenticated, user, getToken]);

  const handleToggle = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const resp = await fetch(`/.netlify/functions/client-follow?clientId=${clientId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await resp.json()) as { following: boolean };
      setFollowing(data.following);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        className="follow-btn"
        data-testid="follow-btn"
        disabled
        title="Sign in to follow this client"
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L8.8 4.6L13 5.2L10 8L10.7 12.2L7 10.3L3.3 12.2L4 8L1 5.2L5.2 4.6L7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Follow
      </button>
    );
  }

  return (
    <button
      className={`follow-btn ${following ? "follow-btn--following" : ""}`}
      data-testid="follow-btn"
      onClick={handleToggle}
      disabled={loading}
      type="button"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1L8.8 4.6L13 5.2L10 8L10.7 12.2L7 10.3L3.3 12.2L4 8L1 5.2L5.2 4.6L7 1Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={following ? "currentColor" : "none"}
        />
      </svg>
      {following ? "Following" : "Follow"}
    </button>
  );
}
