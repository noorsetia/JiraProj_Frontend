import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  BarChart3,
  TrendingUp,
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Target
} from 'lucide-react';

const Analytics = () => {
  const { projectId, id } = useParams();
  const selectedProjectParam = projectId || id;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(selectedProjectParam || '');

  useEffect(() => {
    if (selectedProjectParam) {
      setSelectedProjectId(selectedProjectParam);
    }
  }, [selectedProjectParam]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchAnalytics(selectedProjectId);
    } else {
      setLoading(false);
      setStats(null);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data.data || []);
      } catch {
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

  const fetchAnalytics = async (projectScopeId) => {
    if (!projectScopeId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const endpoint = `/analytics/project/${projectScopeId}`;
      const response = await api.get(endpoint);
      setStats(response.data.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch analytics');
      setStats(null);
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

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        {trend && (
          <span className={`flex items-center text-sm font-semibold ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm font-medium text-gray-700 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const ProgressBar = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-600">{value} / {total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${color}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const activeProjectId = selectedProjectId || selectedProjectParam;
  const displayStats = activeProjectId ? stats : null;
  const statusCounts = (displayStats?.tasksByStatus || []).reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  const priorityCounts = (displayStats?.tasksByPriority || []).reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  const totalTasks = displayStats?.totalTasks || 0;
  const completedTasks = statusCounts.Done || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const sprintProgress = displayStats?.sprintStats?.length
    ? Math.round(
        displayStats.sprintStats.reduce((sum, sprint) => sum + sprint.completionRate, 0) /
          displayStats.sprintStats.length
      )
    : 0;

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-600">
            Understand delivery pace, workload mix, and overall project health.
          </p>
          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Project insights</p>
              <p className="text-xs text-slate-500">Choose a project to explore insights.</p>
            </div>
            <div className="min-w-[240px]">
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="input"
              >
                <option value="">Choose a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name || 'Untitled Project'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {projects.length === 0 && (
            <p className="mt-3 text-xs text-slate-500">No projects found. Create a project to view analytics.</p>
          )}
        </div>

        {!activeProjectId && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Choose a project to explore insights.
          </div>
        )}
        {activeProjectId && !displayStats && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            No analytics available for the selected project yet.
          </div>
        )}

        {displayStats && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FolderKanban}
            title="Task count"
            value={totalTasks}
            subtitle={`${completedTasks} completed`}
            color="from-blue-500 to-blue-600"
            trend={displayStats?.tasksTrend}
          />
          <StatCard
            icon={Target}
            title="Completion rate"
            value={`${completionRate}%`}
            subtitle="Task completion"
            color="from-purple-500 to-purple-600"
            trend={displayStats?.completionTrend}
          />
          <StatCard
            icon={Users}
            title="Sprint progress"
            value={`${sprintProgress}%`}
            subtitle="Average completion"
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={CheckCircle2}
            title="Delayed tasks"
            value={displayStats?.delayedTasks || 0}
            subtitle="Overdue items"
            color="from-orange-500 to-orange-600"
            trend={displayStats?.completionTrend}
          />
        </div>
        )}

        {displayStats && (
          <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Task distribution</h2>
                <p className="text-sm text-slate-500">Where work is sitting right now.</p>
              </div>
              <Target className="h-5 w-5 text-primary-600" />
            </div>
            <div className="mt-6 space-y-5">
              <ProgressBar
                label="To Do"
                value={statusCounts['To Do'] || 0}
                total={totalTasks}
                color="bg-amber-500"
              />
              <ProgressBar
                label="In Progress"
                value={statusCounts['In Progress'] || 0}
                total={totalTasks}
                color="bg-blue-500"
              />
              <ProgressBar
                label="Review"
                value={statusCounts['Review'] || 0}
                total={totalTasks}
                color="bg-purple-500"
              />
              <ProgressBar
                label="Done"
                value={statusCounts.Done || 0}
                total={totalTasks}
                color="bg-emerald-500"
              />
              {totalTasks === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No tasks recorded yet. Add tasks to see distribution.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Priority breakdown</h2>
                <p className="text-sm text-slate-500">Balance critical and routine work.</p>
              </div>
              <AlertCircle className="h-5 w-5 text-primary-600" />
            </div>
            <div className="mt-6 space-y-5">
              <ProgressBar
                label="High Priority"
                value={priorityCounts.High || 0}
                total={totalTasks}
                color="bg-rose-500"
              />
              <ProgressBar
                label="Medium Priority"
                value={priorityCounts.Medium || 0}
                total={totalTasks}
                color="bg-amber-500"
              />
              <ProgressBar
                label="Low Priority"
                value={priorityCounts.Low || 0}
                total={totalTasks}
                color="bg-emerald-500"
              />
              {totalTasks === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No priority data yet. Create tasks to populate this view.
                </div>
              )}
            </div>
          </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
