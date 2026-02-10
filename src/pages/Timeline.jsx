import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Calendar, ChevronLeft, ChevronRight, Search, 
  Filter, User, ZoomIn, ZoomOut, Settings,
  Plus, X, Grip
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

const Timeline = () => {
  const { projectId, id } = useParams();
  const actualProjectId = projectId || id;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('Months'); // Today, Weeks, Months, Quarters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (actualProjectId) {
      fetchTasks();
    }
  }, [actualProjectId]);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${actualProjectId}`);
      setTasks(response.data.data || []);
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const fallbackResponse = await api.get(`/projects/${actualProjectId}/tasks`);
          setTasks(fallbackResponse.data.data || []);
          return;
        } catch (fallbackError) {
          console.error('Fallback fetch tasks error:', fallbackError);
          toast.error('Failed to fetch tasks');
          return;
        }
      }
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Generate timeline columns based on view mode
  const getTimelineColumns = () => {
    const columns = [];
    const today = new Date(currentDate);
    let startDate, endDate, columnCount;

    switch (viewMode) {
      case 'Today':
        // Show 7 days centered on current date
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 3);
        columnCount = 7;
        for (let i = 0; i < columnCount; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          columns.push({
            label: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
            fullDate: new Date(date),
            key: date.toISOString().split('T')[0]
          });
        }
        break;
      
      case 'Weeks':
        // Show 8 weeks
        startDate = new Date(today);
        startDate.setDate(today.getDate() - (today.getDay() || 7)); // Start of current week
        columnCount = 8;
        for (let i = 0; i < columnCount; i++) {
          const weekStart = new Date(startDate);
          weekStart.setDate(startDate.getDate() + (i * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          columns.push({
            label: `Week ${i + 1}`,
            subLabel: `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('en-US', { month: 'short' })}`,
            fullDate: weekStart,
            endDate: weekEnd,
            key: `week-${i}`
          });
        }
        break;
      
      case 'Months':
        // Show 6 months
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        columnCount = 6;
        for (let i = 0; i < columnCount; i++) {
          const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
          columns.push({
            label: monthDate.toLocaleDateString('en-US', { month: 'long' }),
            subLabel: monthDate.getFullYear(),
            fullDate: monthDate,
            key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`
          });
        }
        break;
      
      case 'Quarters':
        // Show 4 quarters
        const currentQuarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), currentQuarter * 3, 1);
        columnCount = 4;
        for (let i = 0; i < columnCount; i++) {
          const quarterStart = new Date(startDate.getFullYear(), startDate.getMonth() + (i * 3), 1);
          const quarter = Math.floor(quarterStart.getMonth() / 3) + 1;
          columns.push({
            label: `Q${quarter}`,
            subLabel: quarterStart.getFullYear(),
            fullDate: quarterStart,
            key: `${quarterStart.getFullYear()}-Q${quarter}`
          });
        }
        break;
      
      default:
        break;
    }

    return columns;
  };

  const columns = getTimelineColumns();

  // Calculate task bar position and width
  const getTaskBarStyle = (task) => {
    if (!task.dueDate) return { display: 'none' };
    
    const taskDate = new Date(task.dueDate);
    const taskStart = new Date(task.createdAt);
    
    // Find which column the task belongs to
    let columnIndex = -1;
    let dayOffset = 0;

    if (viewMode === 'Today') {
      columnIndex = columns.findIndex(col => {
        const colDate = new Date(col.fullDate);
        return colDate.toDateString() === taskDate.toDateString();
      });
    } else {
      columnIndex = columns.findIndex(col => {
        const colStart = new Date(col.fullDate);
        const colEnd = col.endDate ? new Date(col.endDate) : new Date(colStart.getFullYear(), colStart.getMonth() + 1, 0);
        return taskDate >= colStart && taskDate <= colEnd;
      });
    }

    if (columnIndex === -1) return { display: 'none' };

    const columnWidth = 180; // Width of each column
    const left = columnIndex * columnWidth + 16;
    
    // Calculate width based on task duration
    const duration = Math.max(1, Math.ceil((taskDate - taskStart) / (1000 * 60 * 60 * 24)));
    const width = Math.max(120, Math.min(duration * 10, columnWidth - 32));

    return {
      left: `${left}px`,
      width: `${width}px`,
      display: 'block'
    };
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || task.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    'To Do': 'bg-amber-100 text-amber-800 border-amber-300',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
    'Review': 'bg-purple-100 text-purple-800 border-purple-300',
    'Done': 'bg-emerald-100 text-emerald-800 border-emerald-300'
  };

  const priorityColors = {
    Low: 'bg-green-500',
    Medium: 'bg-yellow-500',
    High: 'bg-red-500'
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
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-gray-900">Timeline</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search timeline"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (viewMode === 'Months') newDate.setMonth(currentDate.getMonth() - 1);
                    else if (viewMode === 'Weeks') newDate.setDate(currentDate.getDate() - 7);
                    else newDate.setDate(currentDate.getDate() - 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (viewMode === 'Months') newDate.setMonth(currentDate.getMonth() + 1);
                    else if (viewMode === 'Weeks') newDate.setDate(currentDate.getDate() + 7);
                    else newDate.setDate(currentDate.getDate() + 1);
                    setCurrentDate(newDate);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {['Today', 'Weeks', 'Months', 'Quarters'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === mode
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Timeline Header */}
            <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-300">
              <div className="flex">
                <div className="w-64 px-4 py-3 bg-gray-50 border-r border-gray-300 font-semibold text-gray-700">
                  Work Items
                </div>
                {columns.map((column, index) => (
                  <div
                    key={column.key}
                    className="w-45 px-4 py-3 border-r border-gray-300 text-center"
                    style={{ width: '180px' }}
                  >
                    <div className="font-semibold text-gray-900 text-sm">{column.label}</div>
                    {column.subLabel && (
                      <div className="text-xs text-gray-500 mt-0.5">{column.subLabel}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Content */}
            <div className="relative" ref={timelineRef}>
              {filteredTasks.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No tasks found</p>
                    <p className="text-sm text-gray-500 mt-1">Create a task to get started</p>
                  </div>
                </div>
              ) : (
                filteredTasks.map((task, index) => {
                  const barStyle = getTaskBarStyle(task);
                  return (
                    <div
                      key={task._id}
                      className={`flex border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                      style={{ minHeight: '60px' }}
                    >
                      {/* Task Info Column */}
                      <div className="w-64 px-4 py-3 border-r border-gray-200 flex items-center gap-3">
                        <Grip className="w-4 h-4 text-gray-400 cursor-move" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                              {task.status}
                            </span>
                            {task.assignedTo && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                <span className="truncate">{task.assignedTo.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timeline Bars */}
                      <div className="flex-1 relative" style={{ minWidth: `${columns.length * 180}px` }}>
                        {/* Grid Lines */}
                        {columns.map((col, idx) => (
                          <div
                            key={col.key}
                            className="absolute top-0 bottom-0 border-r border-gray-200"
                            style={{ left: `${idx * 180}px`, width: '180px' }}
                          />
                        ))}

                        {/* Task Bar */}
                        {barStyle.display !== 'none' && (
                          <div
                            className={`absolute top-1/2 transform -translate-y-1/2 h-8 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                              statusColors[task.status]
                            }`}
                            style={barStyle}
                          >
                            <div className="flex items-center justify-between h-full px-3">
                              <span className="text-xs font-medium truncate flex-1">
                                {task.title}
                              </span>
                              <div
                                className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}
                                title={`${task.priority} Priority`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Today Indicator Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 pointer-events-none z-20"
          style={{
            left: `${264 + (columns.findIndex(col => {
              const today = new Date();
              const colDate = new Date(col.fullDate);
              if (viewMode === 'Today') {
                return colDate.toDateString() === today.toDateString();
              }
              return false;
            }) * 180) + 90}px`,
            display: viewMode === 'Today' ? 'block' : 'none'
          }}
        >
          <div className="absolute top-0 -left-1 w-3 h-3 bg-blue-500 rounded-full" />
        </div>
      </div>
    </Layout>
  );
};

export default Timeline;
