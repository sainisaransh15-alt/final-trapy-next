'use client';
import { useEffect } from 'react';
import { Shield, CreditCard, Users, Car, MapPin, Clock, Wallet, ArrowRight, CheckCircle, Search, Plus, Star, Heart, Zap, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SearchWidget from '@/components/SearchWidget';
import FoundersSection from '@/components/FoundersSection';
import Footer from '@/components/Footer';
import { popularRoutes } from '@/lib/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

export default function Index() {
  const { user, profile, signOut, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Redirect to onboarding if user is logged in but hasn't set gender
  useEffect(() => {
    if (!isLoading && user && profile && !profile.gender) {
      router.push('/onboarding');
    }
  }, [user, profile, isLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const trustBadges = [
    { icon: Shield, label: t('home.verifiedIds'), description: t('home.dlVerified') },
    { icon: CreditCard, label: t('home.securePayments'), description: t('home.upiCards') },
    { icon: Users, label: t('home.womenOnly'), description: t('home.safeRides') },
  ];

  const steps = [
    { icon: MapPin, title: t('home.stepSearch'), description: t('home.stepSearchDesc') },
    { icon: Car, title: t('home.stepBook'), description: t('home.stepBookDesc') },
    { icon: Wallet, title: t('home.stepSave'), description: t('home.stepSaveDesc') },
  ];

  const aboutFeatures = [
    { icon: Shield, title: t('home.safetyFirst'), description: t('home.safetyDesc') },
    { icon: Wallet, title: t('home.saveMoney'), description: t('home.saveMoneyDesc') },
    { icon: Users, title: t('home.community'), description: t('home.communityDesc') },
    { icon: Heart, title: t('home.womenSafety'), description: t('home.womenSafetyDesc') },
    { icon: Star, title: t('home.trustedReviews'), description: t('home.trustedReviewsDesc') },
    { icon: Zap, title: t('home.instantBooking'), description: t('home.instantBookingDesc') },
  ];

  const whyChooseItems = [
    t('home.save75'),
    t('home.verifiedDrivers'),
    t('home.womenOnlyOption'),
    t('home.flexiblePickup'),
    t('home.instantConfirm'),
    t('home.freeLaunch'),
  ];

  // Logged-in user view
  if (user) {
    return (
      <div className="min-h-screen pt-20">
        {/* Welcome Section */}
        <section className="py-12 bg-gradient-to-br from-primary/5 to-emerald/5">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {t('home.welcomeBack')} <span className="text-gradient">{profile?.full_name || 'Traveler'}!</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-4">
                {t('home.whatToDo')}
              </p>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="mb-6 text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                {t('nav.logout')}
              </Button>

              {/* Main Action Cards */}
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <Link href="/find-ride" className="group">
                  <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-soft hover:border-primary/30 transition-all h-full">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Search className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">{t('home.findARide')}</h2>
                    <p className="text-muted-foreground mb-4">
                      {t('home.findRideDesc')}
                    </p>
                    <Button className="w-full">
                      {t('home.searchRides')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Link>

                <Link href="/publish" className="group">
                  <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-soft hover:border-emerald/30 transition-all h-full">
                    <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8 text-emerald" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">{t('home.publishARide')}</h2>
                    <p className="text-muted-foreground mb-4">
                      {t('home.publishRideDesc')}
                    </p>
                    <Button variant="outline" className="w-full border-emerald text-emerald hover:bg-emerald hover:text-white">
                      {t('home.publishRide')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{profile?.total_rides || 0}</p>
                  <p className="text-sm text-muted-foreground">{t('common.totalRides')}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald">₹{profile?.wallet_balance || 0}</p>
                  <p className="text-sm text-muted-foreground">{t('common.walletBalance')}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">⭐ {profile?.rating?.toFixed(1) || '5.0'}</p>
                  <p className="text-sm text-muted-foreground">{t('common.rating')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Routes */}
        <section className="py-12 bg-muted/50">
          <div className="container px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{t('home.popularRoutes')}</h2>
              <p className="text-muted-foreground">{t('home.quickAccess')}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {popularRoutes.slice(0, 6).map((route, index) => (
                <Link key={index} href="/find-ride">
                  <div className="bg-card border border-border rounded-xl p-4 hover:shadow-soft hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div className="w-0.5 h-6 bg-border" />
                          <div className="w-2 h-2 rounded-full border-2 border-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{route.from}</p>
                          <p className="text-muted-foreground text-sm">{route.to}</p>
                        </div>
                      </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₹{route.price}</p>
                      <p className="text-xs text-muted-foreground">{t('common.perSeat')}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Guest user view (landing page)
return (
  <div className="min-h-screen">
    {/* Hero Section */}
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald/20 rounded-full blur-3xl animate-float delay-200" />
      </div>

      <div className="container relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4 animate-slide-up">
            {t('home.heroTitle1')}{' '}
            <span className="text-emerald-300">{t('home.heroTitle2')}</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-slide-up delay-100">
            {t('home.heroSubtitle')}
          </p>

          {/* CTA Buttons for guests */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-slide-up delay-150">
            <Link href="/auth">
              <Button size="xl" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
                {t('common.getStarted')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button
                size="xl"
                variant="outline"
                className="!bg-transparent !text-white !border-white/70 hover:!bg-white/15 hover:!text-white shadow-lg shadow-black/20 w-full sm:w-auto"
              >
                {t('nav.login')}
              </Button>
            </Link>
          </div>
        </div>          {/* Search Widget */}
          <div className="max-w-4xl mx-auto animate-slide-up delay-200">
            <SearchWidget variant="hero" />
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-10 animate-slide-up delay-300">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-5 py-3"
              >
                <badge.icon className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">{badge.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

    {/* About Trapy Section */}
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.aboutTitle')} <span className="text-gradient">Trapy</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('home.aboutDescription')}
          </p>
        </div>          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {aboutFeatures.map((feature, index) => (
              <div key={index} className="bg-card border border-border rounded-2xl p-6 hover:shadow-soft transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <FoundersSection />

    {/* How It Works */}
    <section className="py-20 bg-muted/50">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.howItWorks')}</h2>
          <p className="text-muted-foreground text-lg">{t('home.easySteps')}</p>
        </div>          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center group">
                <div className="w-20 h-20 rounded-2xl bg-indigo-light flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute top-8 left-1/2 w-full h-0.5 bg-border -z-10 hidden md:block last:hidden" />
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.popularRoutes')}</h2>
            <p className="text-muted-foreground text-lg">{t('home.mostTraveled')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {popularRoutes.map((route, index) => (
              <Link key={index} href="/find-ride">
                <div className="bg-card border border-border rounded-xl p-4 hover:shadow-soft hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-0.5 h-6 bg-border" />
                        <div className="w-2 h-2 rounded-full border-2 border-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{route.from}</p>
                        <p className="text-muted-foreground text-sm">{route.to}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₹{route.price}</p>
                      <p className="text-xs text-muted-foreground">{t('common.perSeat')}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-2 ml-auto group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Trapy */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('home.whyChoose')} <span className="text-gradient">Trapy?</span>
              </h2>
              <div className="space-y-4">
                {whyChooseItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                <Link href="/auth">
                  <Button size="lg">{t('common.getStarted')}</Button>
                </Link>
                <Link href="/auth">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary/60 text-primary hover:bg-primary/10"
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-emerald/10 rounded-3xl p-8">
                <div className="bg-card rounded-2xl shadow-soft p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-light flex items-center justify-center">
                      <Shield className="w-6 h-6 text-emerald" />
                    </div>
                    <div>
                      <p className="font-semibold">{t('home.safetyFirst')}</p>
                      <p className="text-sm text-muted-foreground">All rides are monitored</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-light flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">On-Time Guarantee</p>
                      <p className="text-sm text-muted-foreground">98% rides on schedule</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                      <p className="font-semibold">Best Prices</p>
                      <p className="text-sm text-muted-foreground">Lowest fare guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-indigo-dark">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            {t('home.readyToSave')}
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            {t('home.joinNow')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                {t('home.startJourney')}
              </Button>
            </Link>
            <Link href="/auth">
              <Button
                size="xl"
                variant="outline"
                className="!bg-transparent !text-primary-foreground !border-primary-foreground/80 hover:!bg-primary-foreground/15 shadow-lg shadow-black/20"
              >
                {t('nav.login')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
