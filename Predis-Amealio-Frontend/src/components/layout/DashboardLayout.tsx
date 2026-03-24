'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  LogOut,
  Users,
  Menu,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = user?.role === 'admin';

  const merchantLinks = [
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

  const adminLinks = [
    { href: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const links = isAdmin ? adminLinks : merchantLinks;

  return (
    <div className="flex h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <div 
        className={`
          bg-white border-r border-[#e5e7eb] flex flex-col justify-between
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-60'}
        `}
      >
        {/* Top Section */}
        <div>
          {/* Header */}
          <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between">
            {!isCollapsed && (
              <div>
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
                  {isAdmin ? 'Admin Panel' : 'Merchant Dashboard'}
                </p>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isCollapsed ? (
                <Menu size={20} className="text-[#001D51]" />
              ) : (
                <X size={20} className="text-[#001D51]" />
              )}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    group flex items-center gap-3 px-3 py-3 rounded-lg mb-1
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-[rgba(11,130,230,0.12)]' 
                      : 'hover:bg-[rgba(11,130,230,0.08)]'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon 
                    size={20} 
                    className={`
                      transition-colors duration-200 flex-shrink-0
                      ${isActive ? 'text-[#0B82E6]' : 'text-[#001D51] group-hover:text-[#0B82E6]'}
                    `}
                  />
                  {!isCollapsed && (
                    <span 
                      className={`
                        transition-opacity duration-200
                        ${isActive ? 'text-[#0B82E6]' : 'text-[#001D51] group-hover:text-[#0B82E6]'}
                      `}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {link.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-[#e5e7eb]">
          {!isCollapsed ? (
            <div>
              <div className="mb-4">
                <p 
                  className="text-sm opacity-70"
                  style={{ color: '#001D51', fontFamily: 'Inter, sans-serif' }}
                >
                  {user?.email}
                </p>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#e5e7eb] hover:bg-gray-100 transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <LogOut size={16} className="text-[#001D51]" />
                <span className="text-[#001D51]">Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <LogOut size={16} className="text-[#001D51]" />
            </button>
          )}
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

export default DashboardLayout;
