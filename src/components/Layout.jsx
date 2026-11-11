
import { NavLink, Link, useLocation } from 'react-router-dom';
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
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: publicView ? '/public-dashboard' : '/dashboard',
      icon: LayoutDashboard
    },
    { name: 'Projects', href: publicView ? '/public-projects' : '/projects', icon: FolderKanban },
    { name: 'Analytics', href: publicView ? '/public-analytics' : '/analytics', icon: BarChart3 },
    { name: 'Calendar', href: publicView ? '/public-calendar' : '/calendar', icon: CalendarDays },
    { name: 'Forms', href: publicView ? '/public-forms' : '/forms', icon: FileText },
    { name: 'List', href: publicView ? '/public-list' : '/list', icon: List },
    { name: 'Summary', href: publicView ? '/public-summary' : '/summary', icon: FileChartPie },
    { name: 'AI Assistant', href: publicView ? '/public-ai-assistant' : '/ai-assistant', icon: Bot }
  ];

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Mobile top bar */}
      <div className="lg:hidden h-14 bg-white border-b border-slate-200">
        <div className="flex h-full items-center justify-between px-4">

          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary-600 text-white flex items-center justify-center font-semibold">
              PM
            </div>
            <div>
              <span className="block text-base font-semibold text-slate-900">
                Project Manager
              </span>
              {publicView && <span className="block text-[10px] font-bold uppercase tracking-wider text-primary-600">Public demo</span>}
            </div>
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
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 transform transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-64'
        } w-72 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >

        <div className="flex flex-col h-full">

          {/* Brand */}
          <div className={`flex items-center ${collapsed ? 'lg:justify-center' : ''} gap-3 px-5 py-5 border-b border-slate-200`}>

            <div className="h-10 w-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-semibold">
              PM
            </div>

            <div className={collapsed ? 'lg:hidden' : ''}>
              <p className="text-sm font-semibold text-slate-900">
                Project Manager
              </p>

              <p className="text-xs text-slate-500">
                {publicView ? 'Public Demo' : 'Workspace'}
              </p>
              <button
                onClick={() => setCollapsed((value) => !value)}
                className="absolute -right-3 top-7 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-primary-600 lg:flex"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <span className="text-xs">{collapsed ? '›' : '‹'}</span>
              </button>
            </div>

          </div>

          {/* Navigation */}
          <nav className={`flex-1 px-3 py-6 space-y-1.5 overflow-y-auto ${collapsed ? 'lg:px-2' : ''}`}>

            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.name === 'Dashboard'}
                className={({ isActive }) =>
                  `group flex items-center ${collapsed ? 'lg:justify-center lg:px-0' : ''} gap-3 px-3.5 py-3 text-sm font-semibold rounded-xl transition-all ${isActive ? 'active' : ''} ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span className={collapsed ? 'lg:hidden' : ''}>{item.name}</span>
                <span className={`ml-auto h-1.5 w-1.5 rounded-full bg-primary-600 opacity-0 transition-opacity group-[.active]:opacity-100 ${collapsed ? 'lg:hidden' : ''}`} />
              </NavLink>
            ))}

          </nav>

          {/* User Profile and Footer */}
          <div className={`p-3 border-t border-slate-200 ${collapsed ? 'lg:px-2' : ''}`}>

            <div className={`flex items-center ${collapsed ? 'lg:justify-center' : ''} gap-3 mb-4`}>

              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  publicView
                    ? 'bg-primary-600'
                    : getAvatarColor(user?.name)
                } text-white font-semibold`}
              >
                {publicView ? 'GD' : getInitials(user?.name)}
              </div>

              <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>

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
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors ${collapsed ? 'lg:px-2' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  <span className={collapsed ? 'lg:hidden' : ''}>Login</span>
                </Link>

                <Link
                  to="/register"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className={collapsed ? 'lg:hidden' : ''}>Create Account</span>
                </Link>

              </div>
            ) : (
              <button
                onClick={handleLogout}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors ${collapsed ? 'lg:px-2' : ''}`}
              >
                <LogOut className="w-4 h-4" />
                <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
              </button>
            )}

          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={`transition-[padding] duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'}`}>

        <div className="hidden lg:flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{publicView ? 'Public Demo' : 'Workspace'}</span>
            <span className="text-slate-300">/</span>
            <span>{publicView ? 'Demo overview' : location.pathname === '/dashboard' ? 'Dashboard' : 'Workspace'}</span>
          </div>

          {publicView ? (
            <div className="demo-banner !py-1.5">
              <span className="demo-dot" />
              <span><strong>Public demo</strong> · Illustrative data only</span>
            </div>
          ) : <Notifications />}

        </div>

        <main className="min-h-screen">
          {publicView && (
            <div className="border-b border-primary-100 bg-primary-50 px-5 py-3 lg:hidden">
              <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs font-semibold text-primary-800">
                <span className="demo-dot shrink-0" />
                <span><strong>Public demo page</strong> · This workspace uses illustrative sample data.</span>
              </div>
            </div>
          )}
          {children}
        </main>

      </div>

    </div>
  );
};

export default Layout;
