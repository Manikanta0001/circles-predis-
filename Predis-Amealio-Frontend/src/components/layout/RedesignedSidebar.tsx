'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Plus, 
  Folder, 
  Share2, 
  Calendar, 
  BarChart3, 
  Settings, 
  Wallet, 
  Star,
  LogOut
} from 'lucide-react';

interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon: Icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-lg mb-1
        transition-all duration-200
        ${isActive 
          ? 'bg-[rgba(11,130,230,0.12)]' 
          : 'hover:bg-[rgba(11,130,230,0.08)]'
        }
      `}
    >
      <Icon 
        size={20} 
        className={`
          transition-colors duration-200
          ${isActive ? 'text-[#0B82E6]' : 'text-[#001D51] group-hover:text-[#0B82E6]'}
        `}
      />
      <span 
        className={`
          transition-colors duration-200
          ${isActive ? 'text-[#0B82E6]' : 'text-[#001D51] group-hover:text-[#0B82E6]'}
        `}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {label}
      </span>
    </Link>
  );
};

interface RedesignedSidebarProps {
  children: React.ReactNode;
}

const RedesignedSidebar: React.FC<RedesignedSidebarProps> = ({ children }) => {
  const menuItems = [
    { href: '/merchant/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/merchant/create', icon: Plus, label: 'Create Content' },
    { href: '/merchant/content', icon: Folder, label: 'Content Library' },
    { href: '/merchant/social', icon: Share2, label: 'Social Media' },
    { href: '/merchant/calendar', icon: Calendar, label: 'Calendar' },
    { href: '/merchant/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/merchant/profile', icon: Settings, label: 'Profile' },
    { href: '/merchant/subscription', icon: Wallet, label: 'Subscription' },
    { href: '/merchant/credits', icon: Star, label: 'Credits' },
  ];

  return (
    <div className="flex h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-[#e5e7eb] flex flex-col justify-between">
        {/* Top Section */}
        <div>
          {/* Header */}
          <div className="p-6 border-b border-[#e5e7eb]">
            <h1 
              className="text-xl font-bold text-[#001D51] mb-1"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Amealio
            </h1>
            <p 
              className="text-sm font-medium text-[#001D51]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Merchant Dashboard
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#e5e7eb]">
          <div className="mb-4">
            <p 
              className="text-sm opacity-70"
              style={{ color: '#001D51', fontFamily: 'Inter, sans-serif' }}
            >
              john.doe@example.com
            </p>
          </div>
          <button 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#e5e7eb] hover:bg-gray-100 transition-colors duration-200"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <LogOut size={16} className="text-[#001D51]" />
            <span className="text-[#001D51]">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default RedesignedSidebar;
