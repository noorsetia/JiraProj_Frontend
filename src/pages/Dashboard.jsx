
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FolderKanban,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  Users
} from 'lucide-react';

const Dashboard = ({ publicView = false }) => {
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(!publicView);

  // Fetch private analytics only for authenticated dashboard
  useEffect(() => {
    if (publicView) {
      setLoading(false);
      return;
    }

    fetchDashboardAnalytics();
  }, [publicView]);

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

  // Public demo statistics (illustrative, not real project data)
  const demoAnalytics = {
    overview: {
      totalProjects: 12,
      totalTasks: 86,
      myTasks: 24,
      delayedTasks: 5,
      completionRate: 75,
      completedTasks: 65,
      myCompletionRate: 80,
      myCompletedTasks: 19
    },
    tasksByStatus: [
      { _id: 'To Do', count: 12 },
      { _id: 'In Progress', count: 25 },
      { _id: 'In Review', count: 14 },
      { _id: 'Completed', count: 35 }
    ]
  };

  const dashboardData = publicView ? demoAnalytics : analytics;

  if (loading) {
    return (
      <Layout publicView={publicView}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      name: 'Total Projects',
      value: dashboardData?.overview?.totalProjects || 0,
      icon: FolderKanban,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Tasks',
      value: dashboardData?.overview?.totalTasks || 0,
      icon: CheckSquare,
      color: 'bg-green-500'
    },
    {
      name: 'My Tasks',
      value: dashboardData?.overview?.myTasks || 0,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      name: 'Delayed Tasks',
      value: dashboardData?.overview?.delayedTasks || 0,
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ];

  return (
    <Layout publicView={publicView}>
      <div className="p-6 lg:p-8 space-y-8">

        {/* Dashboard Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">
            {publicView
              ? 'Welcome to Jira Pro!'
              : `Welcome back, ${user?.name || 'there'}!`}
          </h1>

          <p className="text-sm text-slate-600">
            {publicView
              ? 'Explore how Jira Pro helps teams manage projects, tasks, and productivity.'
              : 'Track project momentum, task progress, and team focus in one place.'}
          </p>

          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />

          {publicView && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              You are viewing a public demo dashboard. All statistics shown here are illustrative sample data.
              No private project or user information is displayed.
            </div>
          )}
        </div>

        {/* Statistics Cards */}
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
                      {stat.value}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-medium text-slate-400">
                  {publicView
                    ? 'Demo'
                    : stat.value
                      ? 'Active'
                      : 'No data'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Overview and Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Progress Overview */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Progress overview
                </h2>

                <p className="text-sm text-slate-500">
                  Keep an eye on completion rates.
                </p>
              </div>

              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>

            <div className="mt-6 space-y-5">

              {/* All Tasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    All Tasks
                  </span>

                  <span className="font-semibold text-slate-900">
                    {dashboardData?.overview?.completionRate || 0}%
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-primary-600"
                    style={{
                      width: `${Math.min(100, Math.max(0, dashboardData?.overview?.completionRate || 0))}%`
                    }}
                  />
                </div>

                <p className="text-xs text-slate-500">
                  {dashboardData?.overview?.completedTasks || 0} of{' '}
                  {dashboardData?.overview?.totalTasks || 0} tasks completed
                </p>
              </div>

              {/* My Tasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    My Tasks
                  </span>

                  <span className="font-semibold text-slate-900">
                    {dashboardData?.overview?.myCompletionRate || 0}%
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, dashboardData?.overview?.myCompletionRate || 0))}%`
                    }}
                  />
                </div>

                <p className="text-xs text-slate-500">
                  {dashboardData?.overview?.myCompletedTasks || 0} of{' '}
                  {dashboardData?.overview?.myTasks || 0} tasks completed
                </p>
              </div>

              {!dashboardData?.overview?.totalTasks && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No task progress yet. Add tasks to see completion metrics here.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Quick actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Jump to high-impact areas.
            </p>

            <div className="mt-5 space-y-3">

              {!publicView ? (
                <>
                  <Link
                    to="/projects"
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-primary-200 hover:bg-primary-50"
                  >
                    <div className="flex items-center gap-3">
                      <FolderKanban className="h-5 w-5 text-primary-600" />
                      View Projects
                    </div>

                    <span className="text-xs text-slate-500">
                      Manage
                    </span>
                  </Link>

                  <Link
                    to="/calendar"
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-primary-200 hover:bg-primary-50"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-primary-600" />
                      Calendar
                    </div>

                    <span className="text-xs text-slate-500">
                      Schedule
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-primary-200 hover:bg-primary-50"
                  >
                    <div className="flex items-center gap-3">
                      <FolderKanban className="h-5 w-5 text-primary-600" />
                      Login to Jira Pro
                    </div>

                    <span className="text-xs text-slate-500">
                      Login
                    </span>
                  </Link>

                  <Link
                    to="/register"
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-primary-200 hover:bg-primary-50"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary-600" />
                      Create Account
                    </div>

                    <span className="text-xs text-slate-500">
                      Register
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Task status distribution
            </h2>

            <span className="text-xs text-slate-500">
              By workflow stage
            </span>
          </div>

          {dashboardData?.tasksByStatus?.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dashboardData.tasksByStatus.map((status) => (
                <div
                  key={status._id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center"
                >
                  <p className="text-2xl font-semibold text-slate-900">
                    {status.count || 0}
                  </p>

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

        {/* Public Dashboard CTA */}
        {publicView && (
          <div className="rounded-2xl bg-primary-600 p-8 text-center text-white shadow-sm">
            <h2 className="text-2xl font-semibold">
              Ready to manage your projects?
            </h2>

            <p className="mt-2 text-sm text-white/80">
              Sign in or create an account to start managing projects and collaborating with your team.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                to="/login"
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition hover:bg-slate-100"
              >
                Get Started
              </Link>

              <Link
                to="/register"
                className="rounded-xl border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Dashboard;
