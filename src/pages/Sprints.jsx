import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

const Sprints = () => {
  const { projectId } = useParams();
  const sprintPlaceholders = [1, 2, 3];
  const visibleSprints = projectId ? sprintPlaceholders : [];

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Sprint Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Plan, track, and review sprint delivery for each project team.
          </p>
        </div>

        {!projectId ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
            Select a project to view its sprints.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Active sprint timeline</h2>
              <p className="mt-1 text-sm text-slate-500">
                Sprint tracking will appear here once your team creates its first sprint.
              </p>
              <div className="mt-6 space-y-4">
                {visibleSprints.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500"
                  >
                    Sprint placeholder {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Sprint status</h2>
              <p className="mt-1 text-sm text-slate-500">No active sprint data yet.</p>
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                <p className="text-sm font-medium text-slate-600">Create your first sprint</p>
                <p className="mt-1 text-xs text-slate-500">Sprint metrics will populate here.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Sprints;
