'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1525] to-[#1a1f35] flex items-center justify-center p-8">
      <div className="w-full max-w-6xl grid grid-cols-2 gap-16 items-center">
        {/* Left side - Hero */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-white rounded-full" />
            </div>
            <h1 className="text-4xl text-[var(--color-text-primary)]">Sirius Compass</h1>
          </div>
          
          <h2 className="text-3xl text-[var(--color-text-primary)] leading-tight">
            Engineering Intelligence for Heterogeneous Projects
          </h2>
          
          <p className="text-lg text-[var(--color-text-secondary)] max-w-lg">
            Unify data from code repositories and task boards into objective metrics. 
            Get real-time insights on velocity, cycle time, and team performance.
          </p>
          
          <div className="pt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-[var(--color-text-primary)]">Normalize project management tools</p>
                <p className="text-sm text-[var(--color-text-muted)]">Connect Jira, Trello, GitHub and more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-[var(--color-text-primary)]">Compute engineering metrics</p>
                <p className="text-sm text-[var(--color-text-muted)]">Track cycle time, throughput, and velocity</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-[var(--color-text-primary)]">AI-powered analysis</p>
                <p className="text-sm text-[var(--color-text-muted)]">Ask questions about your team and projects</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login card */}
        <Card className='bg-[var(--color-background-secondary)] rounded-2xl p-8 border border-[var(--color-border)] shadow-2xl'>
            <CardHeader>
                <CardTitle className='text-2xl text-[var(--color-text-primary)] mb-2'>Sign In</CardTitle>
                <CardDescription className='text-[var(--color-text-secondary)]'>Access your engineering intelligence platform</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-2">
                    <label className="text-sm text-[var(--color-text-secondary)]">Email</label>
                    <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full bg-[var(--color-surface)] text-[var(--color-text-primary)] pl-10 pr-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-text-muted)]"
                        required
                    />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm text-[var(--color-text-secondary)]">Password</label>
                    <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[var(--color-surface)] text-[var(--color-text-primary)] pl-10 pr-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none transition-colors placeholder:text-[var(--color-text-muted)]"
                        required
                    />
                    </div>
                </div>
                </form>
            </CardContent>
            <CardFooter className='flex flex-col gap-4'>
                <Button type='submit' className='w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-3 rounded-lg transition-colors'>
                    Sign In
                </Button>
                <Button variant='outline' className='w-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] py-3 rounded-lg border border-[var(--color-border)] transition-colors'>
                    Sign in with SSO
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}