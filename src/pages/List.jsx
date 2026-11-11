import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { CalendarClock, CheckCircle2, ChevronDown, ListChecks, Search, UserRound } from 'lucide-react';

const demoTasks = [
  { _id: 'demo-list-1', title: 'Review launch checklist', project: { name: 'Platform refresh' }, status: 'In Progress', priority: 'High', dueDate: '2026-11-12', assignee: { name: 'Ava Lee' }, description: 'Review the final launch checklist and confirm ownership.' },
  { _id: 'demo-list-2', title: 'Share mobile prototype', project: { name: 'Mobile companion' }, status: 'To Do', priority: 'Medium', dueDate: '2026-11-18', assignee: { name: 'Mika Tan' }, description: 'Share the latest prototype with the product team.' },
  { _id: 'demo-list-3', title: 'Close feedback loop', project: { name: 'Customer insights' }, status: 'Completed', priority: 'Low', dueDate: '2026-10-28', assignee: { name: 'Jordan Reed' }, description: 'Summarize customer feedback and share next steps.' }
];

const badge = { 'In Progress': 'bg-blue-50 text-blue-700', Completed: 'bg-emerald-50 text-emerald-700', 'To Do': 'bg-slate-100 text-slate-600', 'In Review': 'bg-violet-50 text-violet-700' };
const priority = { High: 'text-rose-600', Medium: 'text-amber-600', Low: 'text-emerald-600' };

const ListPage = ({ publicView = false }) => {
  const [tasks, setTasks] = useState(publicView ? demoTasks : []);
  const [loading, setLoading] = useState(!publicView);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('due');

  useEffect(() => {
    if (publicView) return undefined;
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks/my-tasks');
        setTasks(response.data?.tasks || response.data?.data || response.data || []);
      } catch {
        setError('We could not load your tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
    return undefined;
  }, [publicView]);

  const filtered = useMemo(() => tasks.filter((task) => {
    const query = search.toLowerCase();
    return (!query || `${task.title || ''} ${task.project?.name || ''}`.toLowerCase().includes(query)) && (status === 'All' || (task.status || task.state) === status);
  }).sort((a, b) => sort === 'name' ? (a.title || '').localeCompare(b.title || '') : new Date(a.dueDate || '2999-01-01') - new Date(b.dueDate || '2999-01-01')), [tasks, search, status, sort]);

  return (
    <Layout publicView={publicView}>
      <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400"><span>Workspace</span><span>/</span><span className="text-slate-600">List</span></div>
        <header><p className="eyebrow">Your focus list</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Task list</h1><p className="mt-2 text-sm text-slate-600">Keep every assignment visible, actionable, and moving forward.</p></header>
        {publicView && <div className="demo-banner"><span className="demo-dot" /> Demo tasks · illustrative data only</div>}
        <div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="input pl-10" placeholder="Search tasks or projects..." /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="input w-auto min-w-36"><option>All</option><option>To Do</option><option>In Progress</option><option>In Review</option><option>Completed</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} className="input w-auto min-w-36"><option value="due">Due date</option><option value="name">Task name</option></select></div>
        {loading ? <div className="card h-72 animate-pulse" /> : error ? <div className="card py-14 text-center text-rose-600">{error}</div> : filtered.length === 0 ? <div className="card py-14 text-center"><ListChecks className="mx-auto h-9 w-9 text-slate-300" /><h2 className="mt-4 font-semibold">No tasks found</h2><p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p></div> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden grid-cols-[2fr_1.2fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid"><span>Task</span><span>Project</span><span>Assignee</span><span>Status</span><span>Due</span></div>{filtered.map((task) => { const id = task._id || task.id; const taskStatus = task.status || task.state || 'To Do'; return <div key={id} className="border-b border-slate-100 p-5 last:border-0 hover:bg-slate-50/70"><div className="grid gap-3 md:grid-cols-[2fr_1.2fr_1fr_1fr_1fr] md:items-center"><div className="min-w-0"><button onClick={() => setExpanded(expanded === id ? null : id)} className="text-left font-semibold text-slate-900 hover:text-primary-600">{task.title || task.name || task.summary}</button><p className="mt-1 line-clamp-1 text-xs text-slate-500">{task.description || 'No description available.'}</p></div><div className="text-sm text-slate-600">{task.project?.name || task.projectName || 'No project'}</div><div className="flex items-center gap-2 text-sm text-slate-600"><UserRound className="h-4 w-4 text-slate-400" />{task.assignee?.name || task.assigneeName || 'Unassigned'}</div><div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge[taskStatus] || badge['To Do']}`}>{taskStatus}</span><p className={`mt-2 text-xs font-semibold ${priority[task.priority] || 'text-slate-500'}`}>{task.priority || 'Normal'} priority</p></div><div className="flex items-center gap-1.5 text-sm text-slate-600"><CalendarClock className="h-4 w-4 text-slate-400" />{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</div></div>{expanded === id && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><p className="font-semibold text-slate-800">Task details</p><p className="mt-1 whitespace-pre-wrap">{task.description || task.details || 'No further details provided.'}</p><p className="mt-3 text-xs text-slate-500">Suggested next step: confirm acceptance criteria and update the status when work begins.</p></div>}</div>; })}</div>}
        {publicView && <p className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sign in to manage your tasks and update statuses.</p>}
      </div>
    </Layout>
  );
};

export default ListPage;
