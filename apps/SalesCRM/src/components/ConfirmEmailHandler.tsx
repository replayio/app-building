import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@shared/auth/useAuth";

export function ConfirmEmailHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [error, setError] = useState(token ? "" : "No confirmation token provided.");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function confirmEmail() {
      try {
        const res = await fetch("/.netlify/functions/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "confirm-email", token }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(data.error || "Something went wrong.");
          setStatus("error");
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

        setStatus("success");

        setTimeout(() => {
          if (!cancelled) {
            navigate("/clients", { replace: true });
          }
        }, 1500);
      } catch {
        if (!cancelled) {
          setError("Network error. Please try again.");
          setStatus("error");
        }
      }
    }

    confirmEmail();

    return () => {
      cancelled = true;
    };
  }, [token, login, navigate]);

  if (status === "loading") {
    return (
      <div className="auth-form-card" data-testid="confirm-email-handler">
        <h1 className="auth-form-title">Confirm Email</h1>
        <div className="auth-form-loading" data-testid="confirm-email-loading">
          Confirming your email...
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="auth-form-card" data-testid="confirm-email-handler">
        <h1 className="auth-form-title">Confirm Email</h1>
        <div className="auth-form-success" data-testid="confirm-email-success">
          Email confirmed! Redirecting...
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-card" data-testid="confirm-email-handler">
      <h1 className="auth-form-title">Confirm Email</h1>
      <div className="auth-form-error" data-testid="confirm-email-error">
        {error}
      </div>
      <button
        type="button"
        className="auth-form-link"
        data-testid="confirm-email-signin-link"
        onClick={() => navigate("/clients")}
      >
        Go to Sign In
      </button>
    </div>
  );
}
