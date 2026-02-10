import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Clock, Calendar, Users } from 'lucide-react';

const interpretDescription = (desc = '') => {
  const text = (desc || '').trim();
  const firstSentenceMatch = text.match(/^(.*?[.!?])(\s|$)/);
  const summary = firstSentenceMatch ? firstSentenceMatch[1] : (text.slice(0, 220) + (text.length > 220 ? '...' : ''));

  const suggested = [
    'Read the description and confirm acceptance criteria.',
    'Identify dependencies and missing details; ask clarifying questions if needed.',
    'Estimate time required and set the task status to In Progress when you start.',
    'When finished, add a brief note of what changed and move the task to Done.'
  ];

  return { summary: summary || 'No description provided', suggested };
};

const ListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await api.get('/tasks/my-tasks');
        // support both formats: { tasks: [...] } or direct array
        setTasks(res.data?.tasks || res.data || []);
      } catch (e) {
        console.error(e);
        setError('Failed to load tasks. Make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center gap-4 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
              <Calendar className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">List</h1>
              <p className="text-sm text-slate-600">All scheduled tasks assigned to you. Click a task to read the description and suggested next steps.</p>
            </div>
          </header>

          <div className="bg-white rounded border">
            {loading && <div className="p-6">Loading tasks...</div>}
            {error && <div className="p-6 text-rose-600">{error}</div>}

            {!loading && !error && tasks.length === 0 && (
              <div className="p-6 text-slate-500">No tasks found. Assign tasks or check a different project.</div>
            )}

            {!loading && tasks.length > 0 && (
              <ul className="divide-y">
                {tasks.map(task => {
                  const id = task._id || task.id;
                  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
                  const { summary, suggested } = interpretDescription(task.description || task.summary || '');
                  return (
                    <li key={id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-lg font-medium">{task.title || task.name || task.summary}</div>
                              <div className="text-sm text-slate-500">{task.project?.name || task.projectName || ''}</div>
                            </div>
                            <div className="text-sm text-slate-400 flex items-center gap-2">
                              <div className="flex items-center gap-1"><Clock className="w-4 h-4"/>{due}</div>
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-slate-700">
                            <strong>Short summary:</strong> {summary}
                          </div>

                          <div className="mt-3">
                            <button onClick={() => setExpanded(expanded === id ? null : id)} className="text-sm text-sky-600">{expanded === id ? 'Hide details' : 'View details & suggested steps'}</button>
                          </div>
                        </div>

                        <div className="w-40 text-right text-sm text-slate-500">
                          <div className="flex items-center gap-2 justify-end"><Users className="w-4 h-4" /> {task.assignee?.name || task.assigneeName || 'Unassigned'}</div>
                          <div className="mt-2">Status: <span className="font-medium">{task.status || task.state || '—'}</span></div>
                        </div>
                      </div>

                      {expanded === id && (
                        <div className="mt-4 p-3 bg-slate-50 rounded">
                          <div className="text-sm text-slate-600">
                            <div className="font-medium">Full description</div>
                            <div className="whitespace-pre-wrap mt-1">{task.description || task.details || 'No further details provided.'}</div>
                          </div>

                          <div className="mt-4 text-sm">
                            <div className="font-medium">Suggested next steps</div>
                            <ol className="list-decimal list-inside mt-2 text-slate-700">
                              {suggested.map((s, i) => <li key={i} className="py-1">{s}</li>)}
                            </ol>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListPage;
