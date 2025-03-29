import { getUser } from '@/lib/db/queries';
import { getStripeProducts } from '@/lib/payments/stripe';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { UpgradeButton } from './upgrade-button';

export default async function PricingPage() {
  const user = await getUser();
  const products = await getStripeProducts();

  if (!products.length) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Pricing Unavailable</h1>
        <p className="text-gray-600">
          We're currently updating our pricing plans. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-600">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {products.map((product) => (
          <Card key={product.id} className="relative">
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-3xl font-bold">$8</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Unlimited visualizations</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Advanced chart types</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <UpgradeButton 
                priceId={product.defaultPriceId} 
                isActive={user?.subscriptionStatus === 'active'} 
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 