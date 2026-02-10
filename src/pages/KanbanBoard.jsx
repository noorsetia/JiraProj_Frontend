import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, X, Calendar, User } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const KanbanBoard = () => {
  const { projectId, id } = useParams();
  const actualProjectId = projectId || id; // Handle both route params
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState('To Do');
  const [creatingTask, setCreatingTask] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: ''
  });

  const columns = ['To Do', 'In Progress', 'Review', 'Done'];
  const priorityColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800'
  };
  const columnTints = {
    'To Do': 'bg-amber-50/70',
    'In Progress': 'bg-blue-50/70',
    'Review': 'bg-purple-50/70',
    Done: 'bg-emerald-50/70'
  };

  useEffect(() => {
    if (actualProjectId) {
      fetchTasks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualProjectId]);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${actualProjectId}`);
      setTasks(response.data.data);
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const fallbackResponse = await api.get(`/projects/${actualProjectId}/tasks`);
          setTasks(fallbackResponse.data.data);
          return;
        } catch (fallbackError) {
          toast.error(fallbackError.response?.data?.message || 'Failed to fetch tasks');
          return;
        }
      }
      toast.error(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    setActiveColumn(column);
  };

  const handleDrop = async (status) => {
    if (!draggedTask) return;

    const previousTasks = tasks;
    const updatedTasks = tasks.map(task =>
      task._id === draggedTask._id ? { ...task, status } : task
    );
    setTasks(updatedTasks);
    setActiveColumn(null);

    try {
      await api.put(`/tasks/${draggedTask._id}`, { status });
      toast.success('Task updated successfully');
    } catch {
      setTasks(previousTasks);
      toast.error('Failed to update task');
    }
    setDraggedTask(null);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    if (creatingTask) return;
    setCreatingTask(true);
    try {
      const status = selectedColumn || 'Todo';
      let response;
      try {
        response = await api.post(`/tasks/project/${actualProjectId}`, {
          ...formData,
          project: actualProjectId,
          status
        });
      } catch (error) {
        if (error.response?.status !== 404) {
          throw error;
        }
        response = await api.post(`/projects/${actualProjectId}/tasks`, {
          ...formData,
          project: actualProjectId,
          status
        });
      }
      const createdTask = response.data.data;
      console.log('Created task:', createdTask); // Debug log
      console.log('Current tasks:', tasks); // Debug log
      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks, createdTask];
        console.log('Updated tasks:', updatedTasks); // Debug log
        return updatedTasks;
      });
      toast.success('Task created successfully');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', priority: 'Medium', dueDate: '' });
    } catch (error) {
      console.error('Create task error:', error); // Debug log
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
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

  return (
    <Layout>
      <div className="p-6 lg:p-8 h-[calc(100vh-4rem)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
            <p className="mt-2 text-gray-600">Drag and drop tasks to update their status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100%-5rem)]">
          {columns.map((column) => (
            <div
              key={column}
              className={`rounded-2xl p-4 flex flex-col border border-gray-200 transition-all ${columnTints[column]} ${
                activeColumn === column ? 'ring-2 ring-primary-300 shadow-sm' : ''
              }`}
              onDragOver={(event) => handleDragOver(event, column)}
              onDragLeave={() => setActiveColumn(null)}
              onDrop={() => handleDrop(column)}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  {column}
                  <span className="ml-2 bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1">
                    {getTasksByStatus(column).length}
                  </span>
                </h2>
                <button
                  onClick={() => {
                    setSelectedColumn(column);
                    setShowCreateModal(true);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {getTasksByStatus(column).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-white/60 p-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>No tasks yet</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Add a task to kick things off.</p>
                    <button
                      onClick={() => {
                        setSelectedColumn(column);
                        setShowCreateModal(true);
                      }}
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </button>
                  </div>
                ) : (
                  getTasksByStatus(column).map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      className={`rounded-xl bg-white p-4 shadow-sm border border-gray-200 cursor-move transition-all hover:shadow-md hover:-translate-y-0.5 ${
                        draggedTask?._id === task._id ? 'ring-2 ring-primary-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          {task.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                                {(task.assignedTo.name || 'U')
                                  .split(' ')
                                  .map((part) => part[0])
                                  .slice(0, 2)
                                  .join('')}
                              </span>
                              <span>{task.assignedTo.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3" />
                              <span>Unassigned</span>
                            </div>
                          )}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input w-full"
                    placeholder="Enter task title"
                    disabled={creatingTask}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="input w-full"
                    placeholder="Enter task description"
                    disabled={creatingTask}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="input w-full"
                      disabled={creatingTask}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="input w-full"
                      disabled={creatingTask}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary"
                    disabled={creatingTask}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={creatingTask || !formData.title.trim()}
                  >
                    {creatingTask ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default KanbanBoard;
