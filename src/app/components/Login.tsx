import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface LoginProps {
  onLogin: (params: { loginId: string; password: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    onLogin({ loginId: loginId.trim(), password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <svg
              className="w-8 h-8 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl tracking-tight">Washer</h1>
          <p className="text-muted-foreground">Sign in with your login ID and password</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="h-12 bg-input-background border-border"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-input-background border-border"
              autoComplete="current-password"
            />
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => alert('Please contact your manager or the main administrator to reset your password.')}
                className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full h-12 bg-primary hover:bg-primary/90"
          >
            Sign in
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Mobile and branch washer accounts are detected automatically from your credentials.
        </p>
      </div>
    </div>
  );
}
