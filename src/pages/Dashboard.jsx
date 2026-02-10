import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  Users
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  const fetchDashboardAnalytics = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setAnalytics(response.data.data);
    } catch {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      name: 'Total Projects',
      value: analytics?.overview?.totalProjects || 0,
      icon: FolderKanban,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Tasks',
      value: analytics?.overview?.totalTasks || 0,
      icon: CheckSquare,
      color: 'bg-green-500'
    },
    {
      name: 'My Tasks',
      value: analytics?.overview?.myTasks || 0,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      name: 'Delayed Tasks',
      value: analytics?.overview?.delayedTasks || 0,
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ];

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome back, {user?.name || 'there'}!
          </h1>
          <p className="text-sm text-slate-600">
            Track project momentum, task progress, and team focus in one place.
          </p>
          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${stat.color} rounded-xl p-3 shadow-sm`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">
                      {stat.value ?? 0}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-400">
                  {stat.value ? 'Active' : 'No data'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Progress overview</h2>
                <p className="text-sm text-slate-500">Keep an eye on completion rates.</p>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">All Tasks</span>
                  <span className="font-semibold text-slate-900">
                    {(analytics && analytics.overview && analytics.overview.completionRate) || 0}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-primary-600"
                    style={{
                      width: `${(analytics && analytics.overview && analytics.overview.completionRate) || 0}%`
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {(analytics && analytics.overview && analytics.overview.completedTasks) || 0} of{' '}
                  {(analytics && analytics.overview && analytics.overview.totalTasks) || 0} tasks completed
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">My Tasks</span>
                  <span className="font-semibold text-slate-900">
                    {(analytics && analytics.overview && analytics.overview.myCompletionRate) || 0}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{
                      width: `${(analytics && analytics.overview && analytics.overview.myCompletionRate) || 0}%`
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {(analytics && analytics.overview && analytics.overview.myCompletedTasks) || 0} of{' '}
                  {(analytics && analytics.overview && analytics.overview.myTasks) || 0} tasks completed
                </p>
              </div>

              {(analytics && analytics.overview && analytics.overview.totalTasks) ? null : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No task progress yet. Add tasks to see completion metrics here.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
            <p className="mt-1 text-sm text-slate-500">Jump to high-impact areas.</p>
            <div className="mt-5 space-y-3">
              <a
                href="/projects"
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-primary-200 hover:bg-primary-50"
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className="h-5 w-5 text-primary-600" />
                  View Projects
                </div>
                <span className="text-xs text-slate-500">Manage</span>
              </a>
              <a
                href="/calendar"
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-primary-200 hover:bg-primary-50"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-primary-600" />
                  Calendar
                </div>
                <span className="text-xs text-slate-500">Schedule</span>
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Task status distribution</h2>
            <span className="text-xs text-slate-500">By workflow stage</span>
          </div>

          {analytics && analytics.tasksByStatus && analytics.tasksByStatus.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {analytics.tasksByStatus.map((status) => (
                <div key={status._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-semibold text-slate-900">{status.count || 0}</p>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {status._id || '-'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No status data yet. Create tasks to populate this section.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
