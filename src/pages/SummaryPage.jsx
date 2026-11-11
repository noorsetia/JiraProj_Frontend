import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Activity, CheckCircle2, ClipboardList, FolderKanban, TrendingUp } from 'lucide-react';

const demoProjects = [
  { _id: 'summary-platform', name: 'Platform refresh', status: 'Active', progress: 68, description: 'Core workspace improvements' },
  { _id: 'summary-mobile', name: 'Mobile companion', status: 'Planning', progress: 24, description: 'A focused mobile experience' },
  { _id: 'summary-insights', name: 'Customer insights', status: 'Completed', progress: 100, description: 'Feedback and roadmap synthesis' }
];

const Summary = ({ publicView = false }) => {
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState(publicView ? demoProjects : []);
  const [loading, setLoading] = useState(!publicView);
  const [error, setError] = useState('');

  useEffect(() => {
    if (publicView) return undefined;
    const load = async () => {
      try {
        const [analyticsResponse, projectResponse] = await Promise.all([api.get('/analytics'), api.get('/projects')]);
        setAnalytics(analyticsResponse.data?.data || analyticsResponse.data || {});
        setProjects(projectResponse.data?.projects || projectResponse.data?.data || projectResponse.data || []);
      } catch {
        setError('We could not load your summary. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
    return undefined;
  }, [publicView]);

  const values = useMemo(() => ({
    projects: analytics?.totalProjects ?? projects.length,
    tasks: analytics?.totalTasks ?? (publicView ? 79 : '—'),
    completed: analytics?.completedTasks ?? (publicView ? 52 : '—'),
    pending: analytics?.pendingTasks ?? (publicView ? 27 : '—'),
    completion: analytics?.completionRate ?? (publicView ? 66 : 0)
  }), [analytics, projects.length, publicView]);

  const cards = [
    { label: 'Total projects', value: values.projects, icon: FolderKanban, color: 'bg-primary-50 text-primary-600' },
    { label: 'Total tasks', value: values.tasks, icon: ClipboardList, color: 'bg-violet-50 text-violet-600' },
    { label: 'Completed tasks', value: values.completed, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending tasks', value: values.pending, icon: Activity, color: 'bg-amber-50 text-amber-600' }
  ];

  return (
    <Layout publicView={publicView}>
      <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400"><span>Workspace</span><span>/</span><span className="text-slate-600">Summary</span></div>
        <header><p className="eyebrow">Portfolio intelligence</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Summary</h1><p className="mt-2 text-sm text-slate-600">A clear view of delivery health, project momentum, and team focus.</p></header>
        {publicView && <div className="demo-banner"><span className="demo-dot" /> Demo summary · illustrative data only</div>}
        {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map((card) => <div key={card.label} className="h-28 animate-pulse rounded-2xl bg-white" />)}</div> : error ? <div className="card py-14 text-center text-rose-600">{error}</div> : <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}><Icon className="h-5 w-5" /></div><div><p className="text-xs font-medium text-slate-500">{card.label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{card.value}</p></div></div>; })}</div>
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><section className="card"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Project performance</h2><p className="mt-1 text-sm text-slate-500">Completion across your active portfolio.</p></div><TrendingUp className="h-5 w-5 text-emerald-500" /></div><div className="mt-6 space-y-5">{projects.slice(0, 6).map((project) => { const progress = Math.min(100, Math.max(0, Number(project.progress ?? project.completion ?? 0))); return <div key={project._id || project.id}><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{project.name}</p><p className="mt-0.5 text-xs text-slate-500">{project.status || 'Planning'}</p></div><span className="text-sm font-bold text-slate-700">{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="progress-animated h-full rounded-full bg-primary-600" style={{ width: `${progress}%` }} /></div></div>; })}</div></section><section className="card"><h2 className="text-lg font-bold">Delivery snapshot</h2><p className="mt-1 text-sm text-slate-500">How work is tracking this period.</p><div className="mt-6 flex items-center gap-6"><div className="relative flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(#2563eb ${values.completion}%, #e2e8f0 0)` }}><div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white"><span className="text-2xl font-bold">{values.completion}%</span><span className="text-[11px] text-slate-500">complete</span></div></div><div className="space-y-3 text-sm"><p><span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary-600" />Completed work</p><p><span className="mr-2 inline-block h-2 w-2 rounded-full bg-slate-200" />Remaining work</p></div></div></section></div>
          {!projects.length && <div className="card py-14 text-center text-sm text-slate-500">No project performance data available yet.</div>}
        </>}
      </div>
    </Layout>
  );
};

export default Summary;
