'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import trapyLogo from '@/assets/trapy-logo.png';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  
  const { signInWithGoogle, user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (user && profile) {
      // If user has no gender set, redirect to onboarding
      if (!profile.gender) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    } else if (user && !profile) {
      // Profile not loaded yet, wait a bit
      const timer = setTimeout(() => {
        router.push('/onboarding');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, profile, authLoading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/90 via-primary to-secondary/80 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-soft delay-200" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-float" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30 p-3">
            <img src={trapyLogo} alt="Trapy" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">Trapy</h1>
          <p className="text-white/80 mt-3 font-medium flex items-center justify-center gap-2 text-lg">
            <Sparkles className="w-5 h-5" />
            India's Trusted Ride Network
            <Sparkles className="w-5 h-5" />
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-border/50 animate-slide-up delay-100">
          <h2 className="text-2xl font-bold text-center mb-2 text-foreground">
            Welcome to Trapy
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Join 10 lakh+ travelers across India
          </p>

          {/* Google Sign In */}
          <Button
            type="button"
            className="w-full h-14 text-lg font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-border/50 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          {/* Trust Badges */}
          <div className="mt-10 pt-6 border-t border-border/50">
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-secondary" />
                </div>
                <span className="font-medium">Secure Login</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                </div>
                <span className="font-medium">Verified Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-white/60 text-sm mt-8 animate-fade-in delay-300">
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}
