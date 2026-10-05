import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Sprout,
  FlaskConical,
  Leaf,
  CloudSun,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  LeafyGreen,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/dashboard/crops', label: 'Crops', icon: Sprout },
  { to: '/dashboard/pesticides', label: 'Pesticides', icon: FlaskConical },
  { to: '/dashboard/fertilizers', label: 'Fertilizers', icon: Leaf },
  { to: '/dashboard/weather', label: 'Weather', icon: CloudSun },
  { to: '/dashboard/alerts', label: 'Alerts', icon: Bell },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
          <LeafyGreen className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">AgriSmart</h1>
          <p className="text-xs text-green-300/80">Smart Farming</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/95 text-green-800 shadow-sm'
                    : 'text-green-100/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/30 text-sm font-semibold text-white">
            {profile?.full_name?.charAt(0).toUpperCase() || 'F'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{profile?.full_name || 'Farmer'}</p>
            <p className="truncate text-xs text-green-300/60">Active Farmer</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg p-2 text-green-200/60 transition-colors hover:bg-white/10 hover:text-white"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-green-800 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-green-800 lg:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-green-200 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <LeafyGreen className="h-6 w-6 text-green-600" />
            <span className="font-bold text-green-800">AgriSmart</span>
          </div>
          <div className="w-10" />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
