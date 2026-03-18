'use client';
import { useState } from 'react';
import { Tag, Loader2, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const promoCodeSchema = z.string()
  .trim()
  .min(1, 'Please enter a promo code')
  .max(50, 'Promo code is too long')
  .regex(/^[A-Z0-9_-]+$/i, 'Invalid promo code format');

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_ride_amount: number | null;
  max_discount: number | null;
  is_first_ride_only: boolean | null;
}

interface PromoCodeInputProps {
  subtotal: number;
  onApply: (promoCode: PromoCode | null, discount: number) => void;
  appliedPromo: PromoCode | null;
}

export function PromoCodeInput({ subtotal, onApply, appliedPromo }: PromoCodeInputProps) {
  const { user, profile } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateDiscount = (promo: PromoCode, amount: number): number => {
    let discount = 0;
    if (promo.discount_type === 'percentage') {
      discount = (amount * promo.discount_value) / 100;
      if (promo.max_discount) {
        discount = Math.min(discount, promo.max_discount);
      }
    } else {
      discount = promo.discount_value;
    }
    return Math.min(discount, amount);
  };

  const handleApply = async () => {
    setError('');
    
    // Validate input
    const validation = promoCodeSchema.safeParse(code);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    if (!user) {
      setError('Please login to apply promo codes');
      return;
    }

    setLoading(true);
    try {
      // Fetch promo code
      const { data: promo, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (promoError) throw promoError;

      if (!promo) {
        setError('Invalid or expired promo code');
        setLoading(false);
        return;
      }

      // Check validity period
      if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
        setError('This promo code has expired');
        setLoading(false);
        return;
      }

      // Check usage limit
      if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
        setError('This promo code has reached its usage limit');
        setLoading(false);
        return;
      }

      // Check minimum ride amount
      if (promo.min_ride_amount && subtotal < promo.min_ride_amount) {
        setError(`Minimum order of ₹${promo.min_ride_amount} required`);
        setLoading(false);
        return;
      }

      // Check if first ride only
      if (promo.is_first_ride_only && (profile?.total_rides || 0) > 0) {
        setError('This code is valid for first ride only');
        setLoading(false);
        return;
      }

      // Check if user already used this promo
      const { data: usage, error: usageError } = await supabase
        .from('promo_code_usage')
        .select('id')
        .eq('promo_code_id', promo.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (usageError) throw usageError;

      if (usage) {
        setError('You have already used this promo code');
        setLoading(false);
        return;
      }

      // Calculate discount
      const discount = calculateDiscount(promo, subtotal);
      onApply(promo, discount);
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to apply promo code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onApply(null, 0);
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between p-3 bg-emerald/10 border border-emerald/20 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald" />
          <span className="text-sm font-medium text-emerald">{appliedPromo.code}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="h-7 px-2 text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            className="pl-9 uppercase"
            maxLength={50}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleApply}
          disabled={loading || !code.trim()}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}