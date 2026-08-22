import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Role } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Login() {
  const [role, setRole] = useState<Role>('employee');
  const [email, setEmail] = useState('sarah@dayflow.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  
  const { login } = useStore();
  const navigate = useNavigate();

  const handleRoleSwitch = (newRole: Role) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setEmail('admin@dayflow.com');
    } else {
      setEmail('sarah@dayflow.com');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    login(email, role);
    
    // Redirect based on role
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Sign In</CardTitle>
      </CardHeader>
      <CardContent>
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
