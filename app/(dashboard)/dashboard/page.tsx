import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-gray-600">
          This is your personal dashboard. You can manage your profile and settings here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <p className="font-medium">
                {user.subscriptionStatus === 'active' ? 'Pro Plan' : 'Free Plan'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">{user.subscriptionStatus || 'inactive'}</p>
            </div>
            {user.subscriptionStatus !== 'active' && (
              <Button asChild>
                <Link href="/pricing">Upgrade Plan</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
