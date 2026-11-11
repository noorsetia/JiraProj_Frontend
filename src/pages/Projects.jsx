import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Grid2X2,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

const demoProjects = [
  { _id: 'demo-platform', name: 'Platform refresh', description: 'A focused redesign of the core workspace experience.', status: 'Active', progress: 68, taskCount: 34, members: ['AL', 'MK', 'TS'], startDate: '2026-01-08', endDate: '2026-03-30', createdAt: '2026-01-08' },
  { _id: 'demo-mobile', name: 'Mobile companion', description: 'Bring the team workflow to a fast, focused mobile experience.', status: 'Planning', progress: 24, taskCount: 18, members: ['JR', 'AL'], startDate: '2026-02-01', endDate: '2026-04-15', createdAt: '2026-01-21' },
  { _id: 'demo-insights', name: 'Customer insights', description: 'Turn product feedback into a clear roadmap for the next quarter.', status: 'Completed', progress: 100, taskCount: 27, members: ['TS', 'MK', 'JR', 'AL'], endDate: '2026-01-18', createdAt: '2025-12-10' },
  { _id: 'demo-migration', name: 'Data migration', description: 'Move legacy workspace data with confidence and clear ownership.', status: 'On Hold', progress: 42, taskCount: 12, members: ['MK'], createdAt: '2025-11-18' }
];

const statusStyles = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Completed: 'bg-blue-50 text-blue-700 ring-blue-200',
  Planning: 'bg-amber-50 text-amber-700 ring-amber-200',
  'On Hold': 'bg-slate-100 text-slate-600 ring-slate-200'
};

const getProgress = (project) => Math.min(100, Math.max(0, Number(project.progress ?? project.completion ?? 0)));
const getTaskCount = (project) => project.taskCount ?? project.tasks?.length ?? 0;

const Projects = ({ publicView = false }) => {
  const { isProjectManager } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(!publicView);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');

  useEffect(() => {
    if (publicView) {
      setProjects(demoProjects);
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data.data || []);
      } catch {
        setError('We could not load your projects. Please try again.');
        toast.error('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [publicView]);

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects
      .filter((project) => {
        const matchesSearch = !query || `${project.name || ''} ${project.description || ''}`.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All' || (project.status || 'Planning') === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
        if (sort === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [projects, search, sort, statusFilter]);

  const stats = [
    { label: 'Total projects', value: projects.length, icon: FolderKanban, color: 'bg-primary-50 text-primary-600' },
    { label: 'Active', value: projects.filter((project) => project.status === 'Active').length, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Completed', value: projects.filter((project) => project.status === 'Completed').length, icon: CheckCircle2, color: 'bg-blue-50 text-blue-600' },
    { label: 'On hold', value: projects.filter((project) => project.status === 'On Hold').length, icon: Clock3, color: 'bg-amber-50 text-amber-600' }
  ];

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      const response = await api.post('/projects', formData);
      setProjects((current) => [...current, response.data.data]);
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', startDate: '', endDate: '' });
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl p-5 sm:p-8">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />)}
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout publicView={publicView}>
      <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Workspace</span><span>/</span><span className="text-slate-600">Projects</span>
        </div>

        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Portfolio overview</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Projects</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Plan work, track momentum, and keep every team aligned in one place.</p>
          </div>
          {!publicView && isProjectManager && (
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary gap-2">
              <Plus className="h-4 w-4" /> Create project
            </button>
          )}
        </header>

        {publicView && (
          <div className="demo-banner"><span className="demo-dot" /> Demo projects · illustrative data only</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
            <div key={stat.label} className="card flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.color}`}><StatIcon className="h-5 w-5" /></div>
              <div><p className="text-xs font-medium text-slate-500">{stat.label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{stat.value}</p></div>
            </div>
            );
          })}
        </div>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="input pl-10" placeholder="Search projects by name or description..." aria-label="Search projects" />
            </label>
            <div className="flex flex-wrap gap-3">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input w-auto min-w-32" aria-label="Filter by status">
                {['All', 'Active', 'Planning', 'Completed', 'On Hold'].map((status) => <option key={status} value={status}>{status === 'All' ? 'All statuses' : status}</option>)}
              </select>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="input w-auto min-w-32" aria-label="Sort projects">
                <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option>
              </select>
              <div className="flex rounded-xl border border-slate-200 bg-white p-1">
                <button onClick={() => setView('grid')} className={`rounded-lg p-2 ${view === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`} aria-label="Grid view"><Grid2X2 className="h-4 w-4" /></button>
                <button onClick={() => setView('list')} className={`rounded-lg p-2 ${view === 'list' ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`} aria-label="List view"><List className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="card py-14 text-center"><p className="font-semibold text-slate-900">{error}</p><button className="btn btn-secondary mt-4" onClick={() => window.location.reload()}>Try again</button></div>
          ) : projects.length === 0 ? (
            <div className="card py-14 text-center"><FolderKanban className="mx-auto h-9 w-9 text-slate-300" /><h2 className="mt-4 text-lg font-semibold">No projects yet</h2><p className="mt-1 text-sm text-slate-500">Create your first project to start organizing work.</p></div>
          ) : visibleProjects.length === 0 ? (
            <div className="card py-14 text-center"><SlidersHorizontal className="mx-auto h-9 w-9 text-slate-300" /><h2 className="mt-4 text-lg font-semibold">No matching projects</h2><p className="mt-1 text-sm text-slate-500">Try another search or clear your filters.</p></div>
          ) : (
            <div className={view === 'grid' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
              {visibleProjects.map((project) => <ProjectCard key={project._id} project={project} listView={view === 'list'} publicView={publicView} onBoard={() => navigate(`/kanban/${project._id}`)} />)}
            </div>
          )}
        </section>

        {publicView && <div className="hero-panel flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-lg font-bold text-slate-950">Ready to bring your projects into focus?</p><p className="mt-1 text-sm text-slate-600">Create an account to manage your own workspace.</p></div><Link to="/register" className="btn btn-primary">Get started <ArrowUpRight className="ml-2 h-4 w-4" /></Link></div>}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6"><div><p className="eyebrow">Workspace setup</p><h2 className="mt-1 text-xl font-bold">Create project</h2></div><button onClick={() => setShowCreateModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close dialog"><X className="h-5 w-5" /></button></div>
            <form onSubmit={handleCreateProject} className="space-y-5 p-6">
              <div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="project-name">Project name</label><input id="project-name" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="input" placeholder="e.g. Website redesign" /></div>
              <div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="project-description">Description</label><textarea id="project-description" required rows="4" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} className="input resize-none" placeholder="What are you building?" /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="project-start">Start date</label><input id="project-start" type="date" value={formData.startDate} onChange={(event) => setFormData({ ...formData, startDate: event.target.value })} className="input" /></div><div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="project-end">Deadline</label><input id="project-end" type="date" value={formData.endDate} onChange={(event) => setFormData({ ...formData, endDate: event.target.value })} className="input" /></div></div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button><button type="submit" disabled={creating} className="btn btn-primary">{creating ? 'Creating...' : 'Create project'}</button></div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

const ProjectCard = ({ project, listView, publicView, onBoard }) => {
  const progress = getProgress(project);
  const status = project.status || 'Planning';
  const details = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><FolderKanban className="h-5 w-5" /></div><div className="min-w-0"><h3 className="truncate font-bold text-slate-950">{project.name || 'Untitled project'}</h3><span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusStyles[status] || statusStyles.Planning}`}>{status}</span></div></div>
        <span className="shrink-0 text-sm font-bold text-slate-700">{progress}%</span>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{project.description || 'No description available.'}</p>
      <div className="mt-4"><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="progress-animated h-full rounded-full bg-primary-600" style={{ width: `${progress}%` }} /></div></div>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{getTaskCount(project)} tasks</span>{project.startDate && <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(project.startDate)}</span>}{project.endDate && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />Due {formatDate(project.endDate)}</span>}</div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><div className="flex -space-x-2">{(project.members || []).slice(0, 4).map((member, index) => <span key={`${member}-${index}`} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-600">{typeof member === 'string' ? member.slice(0, 2).toUpperCase() : member.name?.slice(0, 2).toUpperCase()}</span>)}</div>{publicView ? <Link to="/login" className="text-xs font-bold text-primary-600 hover:text-primary-700">Sign in to view <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></Link> : <Link to={`/projects/${project._id}`} className="text-xs font-bold text-primary-600 hover:text-primary-700">View details <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></Link>}</div>
    </>
  );

  return listView ? <article className="card p-5 transition hover:border-primary-200 hover:shadow-md">{details}</article> : <article className="card p-5 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md">{details}{!publicView && <button onClick={onBoard} className="mt-4 text-xs font-semibold text-slate-500 hover:text-primary-600">Open board</button>}</article>;
};

export default Projects;
