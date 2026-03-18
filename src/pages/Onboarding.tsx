'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Upload, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { updateProfile, user, profile } = useAuth();
  const router = useRouter();

  // Get first name from profile or Google metadata
  const firstName = profile?.full_name?.split(' ')[0] || 
                    user?.user_metadata?.full_name?.split(' ')[0] ||
                    user?.user_metadata?.name?.split(' ')[0] ||
                    'there';

  // Animation trigger
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenderSubmit = () => {
    if (gender) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    const { error } = await updateProfile({ gender } as any);
    
    if (!error) {
      router.push('/');
    }
    
    setIsLoading(false);
  };

  const handleSkip = async () => {
    if (gender) {
      await updateProfile({ gender } as any);
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '3s' }} />
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Welcome Message */}
        <div className={`text-center mb-6 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Welcome to Trapy</span>
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Hey {firstName}! 👋
          </h1>
          <p className="text-white/70 mt-1">Let's set up your profile</p>
        </div>

        {/* Progress Steps - Numbered Circles */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  i < step 
                    ? 'bg-white text-indigo-600' 
                    : i === step 
                      ? 'bg-white text-indigo-600 ring-4 ring-white/30 scale-110' 
                      : 'bg-white/20 text-white/60'
                }`}
              >
                {i < step ? <Check className="w-5 h-5" /> : i}
              </div>
              {i < 2 && (
                <div className={`w-12 h-1 mx-2 rounded-full transition-colors duration-300 ${
                  i < step ? 'bg-white' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className={`bg-card rounded-3xl shadow-2xl p-8 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold">Select Your Gender</h2>
                <p className="text-muted-foreground mt-2">
                  This helps us show you relevant ride options
                </p>
              </div>

              <RadioGroup value={gender} onValueChange={setGender} className="space-y-3">
                <div 
                  className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    gender === 'male' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-md' : 'border-border hover:border-indigo-300'
                  }`}
                  onClick={() => setGender('male')}
                >
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="cursor-pointer flex-1 font-medium">Male</Label>
                  <span className="text-2xl">👨</span>
                </div>
                <div 
                  className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    gender === 'female' ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30 shadow-md' : 'border-border hover:border-pink-300'
                  }`}
                  onClick={() => setGender('female')}
                >
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="cursor-pointer flex-1 font-medium">Female</Label>
                  <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full font-medium">Women-only rides</span>
                  <span className="text-2xl">👩</span>
                </div>
                <div 
                  className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    gender === 'other' ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-md' : 'border-border hover:border-purple-300'
                  }`}
                  onClick={() => setGender('other')}
                >
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer flex-1 font-medium">Other</Label>
                  <span className="text-2xl">🧑</span>
                </div>
              </RadioGroup>

              <Button 
                onClick={handleGenderSubmit} 
                className="w-full h-12 text-lg font-semibold transition-all duration-200 hover:scale-[1.02]" 
                size="lg" 
                disabled={!gender}
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Upload className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold">Verify Your Identity</h2>
                <p className="text-muted-foreground mt-2">
                  Upload Driving License for verification (optional)
                </p>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200 cursor-pointer group">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">Why verify?</p>
                    <p className="text-emerald-600/80 dark:text-emerald-400/80">
                      Verified users get instant booking approval and higher trust scores.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleSkip} 
                  className="flex-1 h-12 font-semibold hover:scale-[1.02] transition-all"
                >
                  Skip for now
                </Button>
                <Button 
                  onClick={handleComplete} 
                  className="flex-1 h-12 font-semibold hover:scale-[1.02] transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Please wait...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
