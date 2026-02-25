import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value: string): string | null => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/.netlify/functions/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot-password", email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="auth-form-card" data-testid="forgot-password-form">
        <h1 className="auth-form-title">Forgot Password</h1>
        <div className="auth-form-success" data-testid="forgot-password-success">
          If an account exists with that email, a password reset link has been sent.
        </div>
        <button
          type="button"
          className="auth-form-link"
          data-testid="forgot-password-back-link"
          onClick={() => navigate("/clients")}
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="auth-form-card" data-testid="forgot-password-form">
      <h1 className="auth-form-title">Forgot Password</h1>
      <p className="auth-form-description">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            className="form-input"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="forgot-password-email"
          />
        </div>
        {error && (
          <div className="auth-form-error" data-testid="forgot-password-error">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="btn btn--primary auth-form-submit"
          data-testid="forgot-password-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <button
        type="button"
        className="auth-form-link"
        data-testid="forgot-password-back-link"
        onClick={() => navigate("/clients")}
      >
        Back to Sign In
      </button>
    </div>
  );
}
