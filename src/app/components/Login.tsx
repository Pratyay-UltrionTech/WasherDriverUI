import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { BRAND_NAME, PORTAL_LABEL } from '../lib/branding';
import { AppLogo } from './AppLogo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { apiForgotPasswordWasher, apiVerifyOtpWasher, apiResetPasswordWasher } from '../lib/api';

type FpStep = 'input' | 'otp' | 'reset' | 'done';

function ForgotPasswordFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<FpStep>('input');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setError('');
    setLoading(true);
    try {
      await apiForgotPasswordWasher(identifier.trim());
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiVerifyOtpWasher(identifier.trim(), otp.trim());
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password must contain at least 1 uppercase letter and 1 number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiResetPasswordWasher(identifier.trim(), newPassword);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1 pb-2 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mx-auto mb-2">
              <svg className="w-7 h-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <CardTitle className="text-xl tracking-tight">Reset Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {step === 'input' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enter your Login ID or registered email and we'll send you a 6-digit code.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="fp-identifier">Login ID or email</Label>
                  <Input
                    id="fp-identifier"
                    autoFocus
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. washer01 or washer@example.com"
                    className="h-12 bg-input-background border-border"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90">
                  {loading ? 'Sending…' : 'Send Code'}
                </Button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                >
                  Back to sign in
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enter the 6-digit code sent to the email address on file for{' '}
                  <strong className="text-foreground">{identifier}</strong>.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="fp-otp">6-digit code</Label>
                  <Input
                    id="fp-otp"
                    autoFocus
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="h-14 bg-input-background border-border text-center text-2xl font-mono tracking-widest"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Verifying…' : 'Verify Code'}
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep('input'); setOtp(''); setError(''); }}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                >
                  Resend code
                </button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Create a new password for your account.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="fp-newpw">New password</Label>
                  <div className="relative">
                    <Input
                      id="fp-newpw"
                      autoFocus
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 pr-10 bg-input-background border-border"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-primary"
                    >
                      {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-0.5 pl-1">
                    <li className={newPassword.length >= 6 ? 'text-green-600' : ''}>✓ At least 6 characters</li>
                    <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>✓ One uppercase letter</li>
                    <li className={/\d/.test(newPassword) ? 'text-green-600' : ''}>✓ One number</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fp-confirmpw">Confirm new password</Label>
                  <Input
                    id="fp-confirmpw"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-input-background border-border"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90">
                  {loading ? 'Saving…' : 'Save New Password'}
                </Button>
              </form>
            )}

            {step === 'done' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 text-center">
                  Password updated successfully! Sign in with your new password.
                </div>
                <Button onClick={onClose} className="w-full h-12 bg-primary hover:bg-primary/90">
                  Back to Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface LoginProps {
  onLogin: (params: { loginId: string; password: string }) => void;
  signingIn?: boolean;
  /** Server-side or network error message to display inline. */
  error?: string;
  /** Called whenever the user edits a field so the parent can clear stale errors. */
  onClearError?: () => void;
}

export function Login({ onLogin, signingIn = false, error, onClearError }: LoginProps) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const visibleError = localError || error || '';

  const clearErrors = () => {
    setLocalError('');
    onClearError?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setLocalError('Please enter your Login ID.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }
    setLocalError('');
    onLogin({ loginId: loginId.trim(), password });
  };

  if (showForgotPassword) {
    return <ForgotPasswordFlow onClose={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <AppLogo variant="auth" className="mx-auto" />
          <span className="sr-only">{BRAND_NAME}</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{PORTAL_LABEL}</p>
          <p className="text-sm text-muted-foreground pt-1">Sign in with your login ID and password</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Login ID"
              value={loginId}
              onChange={(e) => { setLoginId(e.target.value); clearErrors(); }}
              className={`h-12 bg-input-background border-border ${visibleError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              disabled={signingIn}
            />
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
                className={`h-12 pr-11 bg-input-background border-border ${visibleError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                autoComplete="current-password"
                disabled={signingIn}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {visibleError && (
              <p role="alert" className="text-sm text-destructive flex items-center gap-1.5 pt-0.5">
                <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {visibleError}
              </p>
            )}

            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90"
            disabled={signingIn}
          >
            {signingIn ? (
              <span className="flex items-center gap-2">
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Signing in…
              </span>
            ) : 'Sign in'}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Mobile and branch washer accounts are detected automatically from your credentials.
        </p>
      </div>
    </div>
  );
}
