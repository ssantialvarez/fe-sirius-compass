import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    // 1. Fondo actualizado para usar variables de tema dinámicas
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-background-primary)] via-[var(--color-background-secondary)] to-[var(--color-background-tertiary)] flex items-center justify-center p-8 transition-colors duration-300">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left side - Hero */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 border-3 border-white rounded-full" />
            </div>
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)]">Sirius Compass</h1>
          </div>
          
          <h2 className="text-3xl font-semibold text-[var(--color-text-primary)] leading-tight">
            Engineering Intelligence for Heterogeneous Projects
          </h2>
          
          <p className="text-lg text-[var(--color-text-secondary)] max-w-lg">
            Unify data from code repositories and task boards into objective metrics. 
            Get real-time insights on velocity, cycle time, and team performance.
          </p>
          
          <div className="pt-8 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mt-1 shrink-0">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">Normalize project management tools</p>
                {/* 2. Corregido el color del texto secundario */}
                <p className="text-sm text-[var(--color-text-secondary)]">Connect Jira, Trello, GitHub and more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mt-1 shrink-0">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">Compute engineering metrics</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Track cycle time, throughput, and velocity</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mt-1 shrink-0">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">AI-powered analysis</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Ask questions about your team and projects</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login card */}
        <Card className='bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)] shadow-2xl transition-colors duration-300'>
            <CardHeader>
                <CardTitle className='text-2xl text-[var(--color-text-primary)] mb-2'>Welcome Back</CardTitle>
                <CardDescription className='text-[var(--color-text-secondary)]'>Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <p className="text-[var(--color-text-secondary)]">
                    Please sign in with your organization account to continue.
                </p>
            </CardContent>
            <CardFooter className='flex flex-col gap-4'>
                {/* 3. Botones simplificados para consistencia y contraste */}
                <Button asChild className='w-full py-6 text-lg rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-md
                    bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] 
                    text-white dark:text-black dark:hover:text-white ring-2
                    ring-[var(--color-primary-foreground)] hover:ring-[var(--color-primary)]
                '>
                    <a href="/auth/login?returnTo=/connections">Login</a>
                </Button>
                <Button asChild variant="outline" className='w-full py-6 text-lg rounded-lg transition-all duration-300 hover:scale-[1.02]
                    border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10
                    /* Variante outline para Signup para diferenciarlo visualmente */
                    dark:border-[var(--color-primary)] dark:text-[var(--color-primary)] dark:hover:bg-[var(--color-primary)]/20
                '>
                    <a href="/auth/login?screen_hint=signup&returnTo=/connections">Signup</a>
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}