import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Role } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Login() {
  const [role, setRole] = useState<Role>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, setToastMessage, toastMessage } = useStore();
  const navigate = useNavigate();

  // Auto-dismiss toast message after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  const handleRoleSwitch = (newRole: Role) => {
    setRole(newRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password.length < 8) {
      setError('Passwords need at least 8 characters, including a number');
      return;
    }

    const res = await login(email, password, role);
    
    if (res?.success) {
      const empName = res.user?.name || (role === 'admin' ? 'Administrator' : 'Employee');
      setToastMessage(`Welcome back, ${empName}! You have successfully logged in.`);
      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res?.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        {toastMessage && (
          <div className="mb-4 bg-emerald-bg border border-emerald/30 text-emerald text-xs font-semibold p-3 rounded-lg flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-text-muted hover:text-emerald p-0.5 rounded cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex p-1 bg-surface-hover rounded-lg mb-6">
          <button 
            onClick={() => handleRoleSwitch('employee')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              role === 'employee' ? "bg-surface shadow-sm text-steel" : "text-text-muted hover:text-ink"
            )}
          >
            Employee
          </button>
          <button 
            onClick={() => handleRoleSwitch('admin')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              role === 'admin' ? "bg-surface shadow-sm text-steel" : "text-text-muted hover:text-ink"
            )}
          >
            Administrator
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com" 
                className="pl-10" 
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-ink">Password</label>
              <a href="#" className="text-sm font-medium text-steel hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="pl-10" 
              />
            </div>
          </div>

          {error && (
            <div className="text-brick text-sm font-medium bg-brick-bg p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center">
            <input type="checkbox" id="remember" className="h-4 w-4 rounded border-border text-steel focus:ring-steel" />
            <label htmlFor="remember" className="ml-2 text-sm text-text-muted">Keep me signed in</label>
          </div>

          <Button type="submit" className="w-full h-11 text-base">
            Sign In
          </Button>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-text-muted">
            <ShieldCheck className="h-4 w-4 text-steel" />
            <span>SSO enabled for your organization</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
