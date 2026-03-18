import { Check, Crown, Zap, Shield, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FREE_TIER_BOOKING_FEE, PREMIUM_SUBSCRIPTION_PRICE } from '@/lib/constants';

export default function TrapyPass() {
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to Trapy Gold",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Coming Soon!",
      description: "Payment integration will be available soon.",
    });
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: '',
      description: 'Basic features for casual travelers',
      features: [
        `Standard Booking Fee (₹${FREE_TIER_BOOKING_FEE}/ride)`,
        'Standard Support',
        'Basic Ride Search',
        'Email Notifications',
      ],
      notIncluded: [
        'Priority Booking',
        'Free Cancellation Insurance',
        'Exclusive Deals',
      ],
      cta: 'Current Plan',
      highlighted: false,
      isCurrent: profile?.subscription_tier === 'free' || !profile,
    },
    {
      name: 'Trapy Gold',
      price: PREMIUM_SUBSCRIPTION_PRICE,
      period: '/month',
      description: 'Premium benefits for frequent travelers',
      features: [
        'Zero Booking Fees',
        'Priority Booking',
        'Free Cancellation Insurance',
        '24/7 Priority Support',
        'Exclusive Deals & Discounts',
        'Premium Badge on Profile',
        'Early Access to New Features',
      ],
      notIncluded: [],
      cta: 'Subscribe Now',
      highlighted: true,
      isCurrent: profile?.subscription_tier === 'premium',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Upgrade to <span className="text-gradient">Trapy Gold</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Save more on every ride with zero booking fees and exclusive benefits
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-primary to-indigo-dark text-primary-foreground border-0'
                  : 'bg-card border border-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-primary-foreground' : ''}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className={plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-2 ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-emerald-300' : 'text-emerald'}`} />
                    <span className={`text-sm ${plan.highlighted ? 'text-primary-foreground/90' : ''}`}>
                      {feature}
                    </span>
                  </div>
                ))}
                {plan.notIncluded.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 opacity-50">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-1.5 h-0.5 bg-current rounded" />
                    </div>
                    <span className={`text-sm line-through ${plan.highlighted ? 'text-primary-foreground/70' : ''}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={plan.highlighted ? handleSubscribe : undefined}
                disabled={plan.isCurrent}
                className={`w-full ${
                  plan.highlighted
                    ? 'bg-white text-primary hover:bg-white/90'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
                size="lg"
              >
                {plan.isCurrent ? 'Current Plan' : plan.cta}
                {!plan.isCurrent && plan.highlighted && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Gold Member Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Priority Booking</h3>
              <p className="text-sm text-muted-foreground">
                Get first access to newly posted rides before regular users
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-light flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-emerald" />
              </div>
              <h3 className="font-semibold mb-2">Free Cancellation</h3>
              <p className="text-sm text-muted-foreground">
                Cancel anytime up to 2 hours before the ride without any charges
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Exclusive Deals</h3>
              <p className="text-sm text-muted-foreground">
                Access members-only discounts and offers from partner brands
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
