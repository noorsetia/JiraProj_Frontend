import { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { CalendarDays } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Simple utility helpers
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const formatDateKey = (d) => d.toISOString().slice(0, 10);

const Calendar = () => {
  const [current, setCurrent] = useState(() => startOfMonth(new Date()));
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState(() => {
    try {
      const raw = localStorage.getItem('pm_meetings');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [showCreate, setShowCreate] = useState(false);
  const [createDate, setCreateDate] = useState(formatDateKey(new Date()));
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetch my tasks (assigned to current user)
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/tasks/my-tasks');
        setTasks(res.data.data || []);
      } catch {
        console.error('Failed to load tasks for calendar');
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  // persist meetings
  useEffect(() => {
    try {
      localStorage.setItem('pm_meetings', JSON.stringify(meetings));
    } catch (e) {
      console.error('Failed to persist meetings', e);
    }
  }, [meetings]);

  const monthGrid = useMemo(() => {
    const start = startOfMonth(current);
    const end = endOfMonth(current);
    // day of week (0=Sun..6=Sat)
    const startDow = start.getDay();
    const daysInMonth = end.getDate();
    const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;
    const cells = [];

    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - startDow;
      const cellDate = new Date(start);
      cellDate.setDate(1 + dayOffset);
      cells.push(cellDate);
    }

    return cells;
  }, [current]);

  const eventsByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const d = new Date(t.dueDate);
      const key = formatDateKey(d);
      map[key] = map[key] || [];
      map[key].push({ type: 'task', id: t._id, title: t.title, project: t.project?.name });
    });

    meetings.forEach((m) => {
      const key = m.date;
      map[key] = map[key] || [];
      map[key].push({ type: 'meeting', id: m.id, title: m.title, time: m.time });
    });

    return map;
  }, [tasks, meetings]);

  const openCreate = (dateKey) => {
    setCreateDate(dateKey);
    setNewMeetingTitle('');
    setShowCreate(true);
  };

  const saveMeeting = () => {
    if (!newMeetingTitle.trim()) return toast.error('Enter meeting title');
    const meeting = {
      id: Date.now().toString(),
      date: createDate,
      title: newMeetingTitle.trim(),
      time: ''
    };
    setMeetings(prev => [...prev, meeting]);
    setShowCreate(false);
    toast.success('Meeting scheduled');
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center gap-4 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100">
              <CalendarDays className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-slate-900">Calendar</h1>
              <p className="text-sm text-slate-600">View your scheduled tasks and meetings.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrent(addMonths(current, -1))}
                className="px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200"
              >
                Prev
              </button>
              <div className="px-4 py-2 font-semibold">{current.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
              <button
                onClick={() => setCurrent(addMonths(current, 1))}
                className="px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200"
              >
                Next
              </button>
            </div>
          </header>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500 mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthGrid.map((cellDate, idx) => {
                const isCurrentMonth = cellDate.getMonth() === current.getMonth();
                const key = formatDateKey(cellDate);
                const events = eventsByDate[key] || [];
                return (
                  <div key={idx} className={`min-h-[110px] border rounded-md p-2 ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'}`}>
                    <div className="flex items-start justify-between">
                      <div className="text-sm font-medium">{cellDate.getDate()}</div>
                      <button onClick={() => openCreate(key)} className="text-xs text-primary-600 hover:underline">+ meeting</button>
                    </div>

                    <div className="mt-2 space-y-1 text-left text-xs">
                      {events.slice(0,3).map(e => (
                        <div key={e.id} className={`rounded px-2 py-1 ${e.type === 'task' ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'}`}>
                          <div className="truncate font-medium">{e.title}</div>
                          {e.type === 'task' && e.project && <div className="text-[10px] text-slate-500">{e.project}</div>}
                          {e.type === 'meeting' && e.time && <div className="text-[10px] text-slate-500">{e.time}</div>}
                        </div>
                      ))}
                      {events.length > 3 && <div className="text-[11px] text-slate-400">+{events.length - 3} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create meeting modal (simple) */}
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Schedule meeting</h3>
                <label className="text-xs text-slate-500">Date</label>
                <input type="date" value={createDate} onChange={(e) => setCreateDate(e.target.value)} className="w-full p-2 border rounded mb-3" />
                <label className="text-xs text-slate-500">Title</label>
                <input type="text" value={newMeetingTitle} onChange={(e) => setNewMeetingTitle(e.target.value)} placeholder="e.g. Client sync" className="w-full p-2 border rounded mb-3" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded bg-slate-100">Cancel</button>
                  <button onClick={saveMeeting} className="px-4 py-2 rounded bg-primary-600 text-white">Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
