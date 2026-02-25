import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@shared/auth/useAuth";

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="auth-form-card" data-testid="reset-password-form">
        <h1 className="auth-form-title">Reset Password</h1>
        <div className="auth-form-error" data-testid="reset-password-error">
          No reset token provided.
        </div>
        <button
          type="button"
          className="auth-form-link"
          data-testid="reset-password-forgot-link"
          onClick={() => navigate("/auth/forgot-password")}
        >
          Request a new reset link
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/.netlify/functions/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password", token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
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

      navigate("/clients", { replace: true });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-card" data-testid="reset-password-form">
      <h1 className="auth-form-title">Reset Password</h1>
      <p className="auth-form-description">
        Enter your new password below.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="reset-password">New Password</label>
          <input
            id="reset-password"
            type="password"
            className="form-input"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="reset-password-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="reset-confirm-password">Confirm Password</label>
          <input
            id="reset-confirm-password"
            type="password"
            className="form-input"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            data-testid="reset-password-confirm"
          />
        </div>
        {error && (
          <div className="auth-form-error" data-testid="reset-password-error">
            {error}
          </div>
        )}
        {error && (error.includes("invalid") || error.includes("expired") || error.includes("already been used")) && (
          <button
            type="button"
            className="auth-form-link auth-form-link--block"
            data-testid="reset-password-forgot-link"
            onClick={() => navigate("/auth/forgot-password")}
          >
            Request a new reset link
          </button>
        )}
        <button
          type="submit"
          className="btn btn--primary auth-form-submit"
          data-testid="reset-password-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
