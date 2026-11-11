import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus, X } from 'lucide-react';

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const demoTasks = [
  { _id: 'demo-1', title: 'Review launch checklist', dueDate: '2026-11-06', status: 'In Progress', project: { name: 'Platform refresh' } },
  { _id: 'demo-2', title: 'Share mobile prototype', dueDate: '2026-11-12', status: 'To Do', project: { name: 'Mobile companion' } },
  { _id: 'demo-3', title: 'Customer feedback review', dueDate: '2026-11-18', status: 'In Review', project: { name: 'Customer insights' } }
];

const Calendar = ({ publicView = false }) => {
  const [current, setCurrent] = useState(() => startOfMonth(new Date()));
  const [tasks, setTasks] = useState(publicView ? demoTasks : []);
  const [meetings, setMeetings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pm_meetings') || '[]'); } catch { return []; }
  });
  const [showCreate, setShowCreate] = useState(false);
  const [createDate, setCreateDate] = useState(dateKey(new Date()));
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [loading, setLoading] = useState(!publicView);

  useEffect(() => {
    if (publicView) return undefined;
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks/my-tasks');
        setTasks(response.data.data || []);
      } catch {
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
    return undefined;
  }, [publicView]);

  useEffect(() => {
    localStorage.setItem('pm_meetings', JSON.stringify(meetings));
  }, [meetings]);

  const cells = useMemo(() => {
    const first = startOfMonth(current);
    const total = Math.ceil((first.getDay() + new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()) / 7) * 7;
    return Array.from({ length: total }, (_, index) => new Date(current.getFullYear(), current.getMonth(), index - first.getDay() + 1));
  }, [current]);

  const eventsByDate = useMemo(() => {
    const map = {};
    tasks.filter((task) => task.dueDate).forEach((task) => {
      const key = dateKey(new Date(task.dueDate));
      map[key] = [...(map[key] || []), { id: task._id, title: task.title, type: 'task', project: task.project?.name, status: task.status }];
    });
    meetings.forEach((meeting) => {
      map[meeting.date] = [...(map[meeting.date] || []), { id: meeting.id, title: meeting.title, type: 'meeting' }];
    });
    return map;
  }, [tasks, meetings]);

  const saveMeeting = () => {
    if (!newMeetingTitle.trim()) return toast.error('Enter a meeting title');
    setMeetings((items) => [...items, { id: Date.now().toString(), date: createDate, title: newMeetingTitle.trim() }]);
    setNewMeetingTitle('');
    setShowCreate(false);
    toast.success('Meeting scheduled');
  };

  return (
    <Layout publicView={publicView}>
      <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400"><span>Workspace</span><span>/</span><span className="text-slate-600">Calendar</span></div>
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="eyebrow">Plan the work</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Calendar</h1><p className="mt-2 text-sm text-slate-600">See deadlines, meetings, and team commitments at a glance.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setCurrent(startOfMonth(new Date()))} className="btn btn-secondary">Today</button>
            <button onClick={() => setCurrent(addMonths(current, -1))} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
            <div className="min-w-36 text-center text-sm font-bold text-slate-900">{current.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
            <button onClick={() => setCurrent(addMonths(current, 1))} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
            {!publicView && <button onClick={() => { setCreateDate(dateKey(new Date())); setShowCreate(true); }} className="btn btn-primary gap-2"><Plus className="h-4 w-4" /> Add event</button>}
          </div>
        </header>
        {publicView && <div className="demo-banner"><span className="demo-dot" /> Demo calendar · illustrative deadlines only</div>}
        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500"><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-primary-500" />Task deadline</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-violet-500" />Meeting</span></div>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold uppercase tracking-wide text-slate-500">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="py-3">{day}</div>)}</div>
          {loading ? <div className="grid grid-cols-7 gap-px bg-slate-200">{cells.map((cell) => <div key={cell.toISOString()} className="min-h-28 animate-pulse bg-white" />)}</div> : <div className="grid grid-cols-7 gap-px bg-slate-200">{cells.map((cell) => {
            const key = dateKey(cell);
            const events = eventsByDate[key] || [];
            const today = key === dateKey(new Date());
            return <div key={key} className={`min-h-28 bg-white p-2 ${cell.getMonth() !== current.getMonth() ? 'bg-slate-50/70 text-slate-300' : ''}`}><div className="flex items-center justify-between"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${today ? 'bg-primary-600 text-white' : ''}`}>{cell.getDate()}</span>{!publicView && <button onClick={() => { setCreateDate(key); setShowCreate(true); }} className="text-slate-300 hover:text-primary-600" aria-label={`Add event on ${key}`}><Plus className="h-4 w-4" /></button>}</div><div className="mt-2 space-y-1">{events.slice(0, 3).map((event) => <div key={event.id} className={`truncate rounded-lg px-2 py-1.5 text-[11px] font-semibold ${event.type === 'task' ? 'bg-primary-50 text-primary-700' : 'bg-violet-50 text-violet-700'}`} title={event.title}><span className="mr-1">{event.type === 'task' ? '•' : '◦'}</span>{event.title}</div>)}{events.length > 3 && <div className="text-[11px] text-slate-400">+{events.length - 3} more</div>}</div></div>;
          })}</div>}
        </section>
        {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="eyebrow">Workspace event</p><h2 className="mt-1 text-xl font-bold">Add meeting</h2></div><button onClick={() => setShowCreate(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><label className="mt-6 block text-sm font-semibold text-slate-700">Date<input type="date" value={createDate} onChange={(event) => setCreateDate(event.target.value)} className="input mt-2" /></label><label className="mt-4 block text-sm font-semibold text-slate-700">Title<input autoFocus value={newMeetingTitle} onChange={(event) => setNewMeetingTitle(event.target.value)} className="input mt-2" placeholder="e.g. Client sync" /></label><div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button><button onClick={saveMeeting} className="btn btn-primary">Save event</button></div></div></div>}
      </div>
    </Layout>
  );
};

export default Calendar;
