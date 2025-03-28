'use client';

import { Button } from '@/components/ui/button';
import { createCheckoutSession } from '@/lib/payments/stripe';

interface UpgradeButtonProps {
  priceId: string;
  isActive: boolean;
}

export function UpgradeButton({ priceId, isActive }: UpgradeButtonProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCheckoutSession({ priceId });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Button type="submit" className="w-full">
        {isActive ? 'Current Plan' : 'Upgrade Now'}
      </Button>
    </form>
  );
} 