import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Calendar, Users, Activity, Trash2, 
  UserPlus, X, CheckCircle, Clock, AlertCircle 
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isProjectManager } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
    if (isProjectManager) {
      fetchUsers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.data);
    } catch {
      toast.error('Failed to fetch project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${id}`);
      setTasks(response.data.data);
    } catch (error) {
      // Try fallback route if the primary route fails
      if (error.response?.status === 404) {
        try {
          const fallbackResponse = await api.get(`/projects/${id}/tasks`);
          setTasks(fallbackResponse.data.data);
          return;
        } catch (fallbackError) {
          console.error('Fallback fetch tasks error:', fallbackError);
          toast.error('Failed to fetch tasks');
          return;
        }
      }
      toast.error('Failed to fetch tasks');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.data);
    } catch {
      toast.error('Failed to fetch users');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      const response = await api.put(`/projects/${id}`, {
        members: [...project.members.map(m => m._id), selectedUser]
      });
      setProject(response.data.data);
      toast.success('Member added successfully');
      setShowAddMemberModal(false);
      setSelectedUser('');
    } catch {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await api.put(`/projects/${id}`, {
        members: project.members.filter(m => m._id !== memberId).map(m => m._id)
      });
      setProject(response.data.data);
      toast.success('Member removed successfully');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const todo = tasks.filter(t => t.status === 'Todo').length;
    return { total, completed, inProgress, todo };
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

  if (!project) {
    return null;
  }

  const stats = getTaskStats();

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Projects
        </button>

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`badge ${
                project.status === 'Active' ? 'badge-success' : 
                project.status === 'Completed' ? 'badge-primary' : 'badge-warning'
              }`}>
                {project.status}
              </span>
              {isProjectManager && (
                <button
                  onClick={handleDeleteProject}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete Project"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <div>
                <p className="text-sm">Start Date</p>
                <p className="font-medium">{project.startDate ? formatDate(project.startDate) : 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <div>
                <p className="text-sm">End Date</p>
                <p className="font-medium">{project.endDate ? formatDate(project.endDate) : 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2" />
              <div>
                <p className="text-sm">Team Members</p>
                <p className="font-medium">{project.members?.length || 0} members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Activity className="w-10 h-10 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">To Do</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todo}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
            {isProjectManager && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="btn btn-primary btn-sm flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.members?.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mr-3">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                {isProjectManager && member._id !== user._id && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/kanban/${id}`}
              className="btn btn-primary"
            >
              View Kanban Board
            </Link>
            <Link
              to={`/timeline/${id}`}
              className="btn btn-secondary"
            >
              View Timeline
            </Link>
            <Link
              to={`/sprints?project=${id}`}
              className="btn btn-secondary"
            >
              Manage Sprints
            </Link>
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Add Team Member</h2>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="input w-full mb-4"
                >
                  <option value="">Choose a user...</option>
                  {users
                    .filter(u => !project.members.some(m => m._id === u._id))
                    .map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                </select>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddMemberModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedUser}
                    className="btn btn-primary"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectDetails;
