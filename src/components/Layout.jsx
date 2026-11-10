
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  Menu,
  X,
  BarChart3,
  CalendarDays,
  FileText,
  List,
  FileChartPie,
  Bot,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useState } from 'react';
import { getInitials, getAvatarColor } from '../utils/helpers';
import Notifications from './Notifications';

const Layout = ({ children, publicView = false }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: publicView ? '/public-dashboard' : '/dashboard',
      icon: LayoutDashboard
    },
    { name: 'Projects', href: '/public-projects', icon: FolderKanban },
    { name: 'Analytics', href: '/public-analytics', icon: BarChart3 },
    { name: 'Calendar', href: '/public-calendar', icon: CalendarDays },
    { name: 'Forms', href: '/public-forms', icon: FileText },
    { name: 'List', href: '/public-list', icon: List },
    { name: 'Summary', href: '/public-summary', icon: FileChartPie },
    { name: 'AI Assistant', href: '/public-ai-assistant', icon: Bot }
  ];

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">

          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary-600 text-white flex items-center justify-center font-semibold">
              PM
            </div>
            <span className="text-base font-semibold text-slate-900">
              Project Manager
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!publicView && <Notifications />}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >

        <div className="flex flex-col h-full">

          {/* Brand */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">

            <div className="h-10 w-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-semibold">
              PM
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Project Manager
              </p>

              <p className="text-xs text-slate-500">
                {publicView ? 'Public Demo' : 'Workspace'}
              </p>
            </div>

          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">

            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.name === 'Dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}

          </nav>

          {/* User Profile and Footer */}
          <div className="p-4 border-t border-slate-200">

            <div className="flex items-center gap-3 mb-4">

              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  publicView
                    ? 'bg-primary-600'
                    : getAvatarColor(user?.name)
                } text-white font-semibold`}
              >
                {publicView ? 'GD' : getInitials(user?.name)}
              </div>

              <div className="min-w-0">

                <p className="text-sm font-semibold text-slate-900 truncate">
                  {publicView ? 'Guest Visitor' : user?.name || 'User'}
                </p>

                <p className="text-xs text-slate-500 truncate">
                  {publicView ? 'Demo Access' : user?.role || 'Member'}
                </p>

              </div>

            </div>

            {publicView ? (
              <div className="space-y-2">

                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>

                <Link
                  to="/register"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </Link>

              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">

        <div className="hidden lg:flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">

          <div className="text-sm text-slate-500">
            {publicView ? 'Welcome to Jira Pro Demo' : 'Welcome back'}
          </div>

          {!publicView && <Notifications />}

        </div>

        <main className="min-h-screen pt-16 lg:pt-0">
          {children}
        </main>

      </div>

    </div>
  );
};

export default Layout;
