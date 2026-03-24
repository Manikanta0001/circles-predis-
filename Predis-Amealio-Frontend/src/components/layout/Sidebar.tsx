'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  TrendingUp, 
  FileText, 
  Package, 
  Settings, 
  MessageSquare,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  isCollapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon: Icon, label, isCollapsed }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        group relative flex items-center gap-3 px-3 py-3 rounded-lg mb-2 
        transition-all duration-300 ease-in-out
        ${isActive 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
          : 'hover:bg-slate-700 text-slate-300 hover:translate-x-1'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
    >
      <Icon 
        size={20} 
        className={`transition-transform duration-300 ${isCollapsed ? 'scale-100' : 'group-hover:scale-110'}`}
      />
      {!isCollapsed && (
        <span className="ml-3 transition-opacity duration-300">
          {label}
        </span>
      )}
    </Link>
  );
};

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const sidebarItems = [
    { href: '/merchant/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/merchant/search', icon: Search, label: 'Search' },
    { href: '/merchant/insights', icon: TrendingUp, label: 'Insights' },
    { href: '/merchant/docs', icon: FileText, label: 'Docs' },
    { href: '/merchant/products', icon: Package, label: 'Products' },
    { href: '/merchant/settings', icon: Settings, label: 'Settings' },
    { href: '/merchant/messages', icon: MessageSquare, label: 'Messages' },
  ];

  return (
    <div 
      className={`
        relative bg-gradient-to-b from-slate-900 to-slate-800
        border-r border-slate-700
        transition-all duration-300 ease-in-out
        ${isHovered ? 'w-60' : isCollapsed ? 'w-16' : 'w-60'}
      `}
      onMouseEnter={() => !isCollapsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Area */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
        </div>
        {!isCollapsed && (
          <h2 className="text-white text-lg font-semibold">Navigation</h2>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Section Separators */}
      {!isCollapsed && (
        <div className="px-4 py-2">
          <div className="h-px bg-slate-700 mb-2"></div>
          <div className="h-px bg-slate-700 mb-2"></div>
        </div>
      )}

      {/* Bottom Account Area */}
      <div className="p-4 border-t border-slate-700">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500"></div>
              <div>
                <p className="text-white text-sm font-medium">John Doe</p>
                <p className="text-slate-400 text-xs">john@example.com</p>
              </div>
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors duration-300">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button 
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors duration-300"
            >
              <Menu size={20} className="text-slate-400" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      {!isCollapsed && (
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700 transition-colors duration-300"
        >
          <X size={16} className="text-slate-400" />
        </button>
      )}
    </div>
  );
};

export default Sidebar;
