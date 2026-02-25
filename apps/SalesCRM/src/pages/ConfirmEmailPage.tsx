import { ConfirmEmailHandler } from "../components/ConfirmEmailHandler";

export function ConfirmEmailPage() {
  return (
    <div className="auth-page" data-testid="confirm-email-page">
      <ConfirmEmailHandler />
    </div>
  );
}
