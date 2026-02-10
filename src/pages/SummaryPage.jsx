import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { FileChartPie, Users, CheckCircle, ClipboardList } from 'lucide-react';
import api from '../utils/api';

const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="rounded-lg border p-4 bg-white">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded bg-emerald-50 text-emerald-600">{icon}</div>
      <div>
        <div className="text-xs text-slate-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {subtitle && <div className="text-sm text-slate-400">{subtitle}</div>}
      </div>
    </div>
  </div>
);

const Summary = () => {
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [aRes, pRes] = await Promise.all([
          api.get('/analytics'),
          api.get('/projects')
        ]);
        setAnalytics(aRes.data?.data || aRes.data || null);
        const projs = pRes.data?.projects || pRes.data || [];
        setProjects(projs);

        // Fetch sprints for first project (if any) to show an example
        if (projs.length > 0) {
          try {
            const sRes = await api.get(`/sprints/project/${projs[0]._id || projs[0].id}`);
            setSprints(sRes.data || []);
          } catch {
            // ignore sprint errors
            setSprints([]);
          }
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load summary data. Ensure you are authenticated.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center gap-4 pb-6 justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
              <FileChartPie className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Summary</h1>
              <p className="text-sm text-slate-600">High-level summaries and project snapshots.</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setCompact(!compact)} className="px-3 py-1 rounded border bg-slate-50 text-sm">
                {compact ? 'Detailed view' : 'Compact view'}
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Projects" value={analytics ? analytics.totalProjects : '—'} subtitle="Total / Active" icon={<Users className="w-5 h-5" />} />
            <StatCard title="Tasks" value={analytics ? analytics.totalTasks : '—'} subtitle={`Done: ${analytics ? analytics.completedTasks : '—'}`} icon={<ClipboardList className="w-5 h-5" />} />
            <StatCard title="Completion" value={analytics ? `${analytics.completionRate}%` : '—'} subtitle={`This week: ${analytics ? analytics.tasksCompletedThisWeek : '—'}`} icon={<CheckCircle className="w-5 h-5" />} />
          </div>
          {loading && <div className="p-4 bg-white rounded border">Loading summary...</div>}
          {error && <div className="p-4 text-rose-600">{error}</div>}

          {!loading && !error && (
            compact ? (
              <div className="bg-white rounded border p-4">
                <h3 className="font-semibold mb-3">Compact Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projects.slice(0, 8).map(p => (
                    <div key={p._id || p.id} className="p-2 border rounded text-sm">{p.name}</div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-slate-500">Toggle to Detailed view for full project and sprint lists.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <section className="col-span-2 bg-white rounded border p-4">
                  <h3 className="font-semibold mb-3">Projects</h3>
                  {projects.length === 0 && <div className="text-sm text-slate-500">No projects found.</div>}
                  {projects.length > 0 && (
                    <ul className="space-y-3">
                      {projects.slice(0, 6).map(p => (
                        <li key={p._id || p.id} className="p-3 border rounded">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-sm text-slate-500">{p.description}</div>
                            </div>
                            <div className="text-sm text-slate-400">Members: {p.members?.length || 0}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <aside className="bg-white rounded border p-4">
                  <h3 className="font-semibold mb-3">Sprints (project sample)</h3>
                  {sprints.length === 0 && <div className="text-sm text-slate-500">No sprints found for the selected project.</div>}
                  {sprints.length > 0 && (
                    <ul className="space-y-2">
                      {sprints.slice(0, 8).map(s => (
                        <li key={s._id || s.id} className="p-2 border rounded">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-slate-500">{new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </aside>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Summary;
