import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';

const PublicProject = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/public/projects/${id}`);
        setProject(response.data.data);
      } catch (err) {
        console.error('Failed to load public project:', err);

        setError(
          err.response?.data?.message ||
          'Unable to load project'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-sm text-slate-500">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />

          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            Project Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || 'This project is no longer available.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-primary-600">
                Public Project
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {project.name}
              </h1>

              <p className="mt-3 text-slate-600">
                {project.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">

                {project.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Start: {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {project.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      End: {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    Created by {project.createdBy?.name}
                  </span>
                </div>

              </div>
            </div>

            <span className="inline-flex w-fit px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold">
              {project.status}
            </span>

          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <ListTodo className="w-5 h-5 text-primary-600" />
              <span className="text-sm text-slate-500">
                Total Tasks
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {project.stats.totalTasks}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-500">
                Completed
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {project.stats.completedTasks}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary-600" />
              <span className="text-sm text-slate-500">
                Completion
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {project.stats.completionRate}%
            </p>

            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full"
                style={{
                  width: `${project.stats.completionRate}%`
                }}
              />
            </div>
          </div>

        </div>

        {/* Team */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">

          <div className="flex items-center gap-3 mb-5">
            <Users className="w-5 h-5 text-primary-600" />

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Team Members
              </h2>

              <p className="text-sm text-slate-500">
                People working on this project
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {project.members.map((member, index) => (
              <div
                key={`${member.name}-${index}`}
                className="border border-slate-200 rounded-xl p-4"
              >
                <p className="font-medium text-slate-900">
                  {member.name}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  {member.role}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Project Tasks
              </h2>

              <p className="text-sm text-slate-500">
                Current project delivery status
              </p>
            </div>
          </div>

          {project.tasks.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No tasks available.
            </div>
          ) : (
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {task.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">

                        <span>
                          Assigned to:{' '}
                          {task.assignedTo?.name || 'Unassigned'}
                        </span>

                        {task.dueDate && (
                          <span>
                            Due:{' '}
                            {new Date(
                              task.dueDate
                            ).toLocaleDateString()}
                          </span>
                        )}

                      </div>
                    </div>

                    <div className="flex items-center gap-2">

                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        {task.priority}
                      </span>

                      <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                        {task.status}
                      </span>

                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        <div className="text-center mt-8 text-sm text-slate-400">
          Shared Project • Project Management System
        </div>

      </div>
    </div>
  );
};

export default PublicProject;