import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../../../api/client.js";

export default function Reset() {
  const [params] = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = params.get("token");
    if (t) setToken(t);
  }, [params]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!token.trim()) return setError("Reset token is required");
    if (!password.trim()) return setError("Password is required");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setSubmitting(true);
    try {
      const res = await api('/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to set password');
      setSuccess('Password updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Failed to set password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--neutral-100)] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 lg:p-8 shadow-soft border border-[color:var(--neutral-200)]">
        <h1 className="text-xl sm:text-2xl font-semibold text-[color:var(--neutral-900)]">Set Your Password</h1>
        <p className="mt-1 text-xs sm:text-sm text-[color:var(--neutral-600)]">Paste your invite/reset token and choose a new password.</p>

        <form className="mt-4 sm:mt-6 space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="token" className="block text-xs sm:text-sm font-semibold text-[color:var(--neutral-800)]">Reset Token</label>
            <input id="token" type="text" value={token} onChange={(e) => setToken(e.target.value)} className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:border-[color:var(--brand-600)] focus:outline-none" placeholder="Paste token from email or open /reset?token=..." />
            <p className="mt-1 text-[10px] sm:text-xs text-[color:var(--neutral-600)]">If you clicked a link from your email, the token should be pre-filled.</p>
          </div>
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-[color:var(--neutral-800)]">New Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:border-[color:var(--brand-600)] focus:outline-none" placeholder="Minimum 8 characters" />
            <p className="mt-1 text-[10px] sm:text-xs text-[color:var(--neutral-600)]">Password must be at least 8 characters long.</p>
          </div>
          <div>
            <label htmlFor="confirm" className="block text-xs sm:text-sm font-semibold text-[color:var(--neutral-800)]">Confirm Password</label>
            <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:border-[color:var(--brand-600)] focus:outline-none" placeholder="Re-enter password" />
          </div>

          {error && (<p className="rounded-lg sm:rounded-xl bg-red-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-red-600">{error}</p>)}
          {success && (<p className="rounded-lg sm:rounded-xl bg-emerald-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-emerald-700">{success}</p>)}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
            <Link to="/forgot-password" className="rounded-xl border border-[color:var(--neutral-200)] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)] text-center w-full sm:w-auto" onClick={() => { setToken(''); setPassword(''); setConfirm(''); setError(''); setSuccess(''); }}>Request New Token</Link>
            <button type="submit" className="rounded-xl bg-[color:var(--brand-600)] px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)] disabled:opacity-60 w-full sm:w-auto" disabled={submitting}>{submitting ? 'Updating Password…' : 'Update Password'}</button>
          </div>
        </form>
        
        <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-[color:var(--neutral-600)]">
          <Link to="/login" className="font-semibold text-[color:var(--brand-600)] hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
