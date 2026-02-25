import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

export function ForgotPasswordPage() {
  return (
    <div className="auth-page" data-testid="forgot-password-page">
      <ForgotPasswordForm />
    </div>
  );
}
