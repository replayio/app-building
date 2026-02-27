import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@shared/auth/useAuth";

export function SidebarAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuth();

  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setIsSubmitting(true);

    try {
      const endpoint = "/.netlify/functions/auth";
      const action = authMode === "signin" ? "signin" : "signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        setIsSubmitting(false);
        return;
      }

      if (data.requiresConfirmation) {
        setAuthMessage("A confirmation email has been sent. Please check your inbox.");
        setIsSubmitting(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatarUrl: data.user.avatarUrl,
      });

      setShowAuthForm(false);
      setEmail("");
      setPassword("");
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("auth_token");
    logout();
  };

  return (
    <div className="sidebar-user-area" data-testid="sidebar-user-area">
      {isAuthenticated && user ? (
        <div data-testid="sidebar-user-info">
          <div className="sidebar-user">
            <div className="sidebar-avatar" data-testid="sidebar-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} style={{ width: 24, height: 24, borderRadius: "50%" }} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="sidebar-user-name" data-testid="sidebar-user-name">{user.name}</span>
          </div>
          {/* Tests: Sign Out returns to unauthenticated state */}
          <button
            className="sidebar-signout-btn"
            data-testid="sidebar-signout-btn"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div data-testid="sidebar-auth-area">
          {!showAuthForm ? (
            /* Tests: Sign In button displays when not authenticated, Clicking Sign In reveals inline auth form */
            <button
              className="sidebar-signin-btn"
              data-testid="sidebar-signin-btn"
              onClick={() => {
                setShowAuthForm(true);
                setAuthMode("signin");
                setEmail("");
                setPassword("");
                setAuthError("");
                setAuthMessage("");
              }}
            >
              Sign In
            </button>
          ) : (
            <form
              className="sidebar-auth-form"
              data-testid="sidebar-auth-form"
              onSubmit={handleAuthSubmit}
            >
              {/* Tests: Sign In form submission with valid credentials, Sign In form shows error for invalid credentials,
                  Sign Up form submission creates account (test mode) */}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="sidebar-auth-email"
                required
              />
              {/* Tests: Sign In form submission with valid credentials, Sign In form shows error for invalid credentials,
                  Sign Up form submission creates account (test mode) */}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="sidebar-auth-password"
                required
              />
              {authError && (
                <div className="sidebar-auth-error" data-testid="sidebar-auth-error">
                  {authError}
                </div>
              )}
              {authMessage && (
                <div className="sidebar-auth-message" data-testid="sidebar-auth-message">
                  {authMessage}
                </div>
              )}
              {/* Tests: Sign In form submission with valid credentials, Sign In form shows error for invalid credentials,
                  Sign Up form submission creates account (test mode) */}
              <button
                type="submit"
                className="sidebar-auth-submit-btn"
                data-testid="sidebar-auth-submit-btn"
                disabled={isSubmitting}
              >
                {authMode === "signin" ? "Sign In" : "Sign Up"}
              </button>
              <div className="sidebar-auth-links">
                {/* Tests: Forgot password link navigates to /auth/forgot-password */}
                <button
                  type="button"
                  className="sidebar-auth-link"
                  data-testid="sidebar-forgot-password-link"
                  onClick={() => navigate("/auth/forgot-password")}
                >
                  Forgot password?
                </button>
                {/* Tests: Sign In / Sign Up toggle switches form mode */}
                <button
                  type="button"
                  className="sidebar-auth-toggle"
                  data-testid="sidebar-auth-toggle"
                  onClick={() => {
                    setAuthMode(authMode === "signin" ? "signup" : "signin");
                    setAuthError("");
                    setAuthMessage("");
                  }}
                >
                  {authMode === "signin" ? "Sign Up" : "Sign In"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
