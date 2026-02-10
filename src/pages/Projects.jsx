import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, FolderKanban, Users, Calendar, X, Clock, TrendingUp, CheckCircle, Trello } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const Projects = () => {
  const { isProjectManager } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data);
    } catch {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await api.post('/projects', formData);
      setProjects([...projects, response.data.data]);
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', startDate: '', endDate: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
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
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Projects</h1>
            <p className="mt-2 text-sm text-slate-600">Manage and track your projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <FolderKanban className="h-7 w-7 text-slate-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No projects yet</h3>
            <p className="mt-2 text-sm text-slate-600 max-w-sm">
              Start by creating your first project to organize tasks and milestones.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 btn btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Project
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600">
                      <FolderKanban className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project</p>
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600">
                        {project.name || 'Untitled Project'}
                      </h3>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    project.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : project.status === 'Completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    {project.status || 'Planning'}
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                  {project.description || 'No description available.'}
                </p>

                <div className="mt-5 border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary-500" />
                      <span>{project.members?.length || 0} members</span>
                    </div>
                    {project.status === 'Completed' && (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    )}
                    {project.status === 'Active' && (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    )}
                    {project.status === 'Planning' && (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>
                  {project.startDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDate(project.startDate)}
                        {project.endDate && ` - ${formatDate(project.endDate)}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <span className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white">
                    View Details
                  </span>
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(`/kanban/${project._id}`);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-200 px-4 py-2 text-xs font-semibold text-primary-700 transition hover:bg-primary-50"
                  >
                    <Trello className="h-4 w-4" />
                    Kanban Board
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="input w-full"
                  placeholder="Enter project description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile/Quick Access */}
      {isProjectManager && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 lg:hidden"
          title="Create New Project"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}
    </Layout>
  );
};

export default Projects;
