'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu, Palette } from 'lucide-react';

const navigation = [
  { href: '/dashboard', icon: Users, label: 'Profile' },
  { href: '/canvas', icon: Palette, label: 'Canvas' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-50 border-r">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm ${
                pathname === item.href
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
