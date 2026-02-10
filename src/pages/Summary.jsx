import Layout from '../components/Layout';
import { FileChartPie } from 'lucide-react';

const Summary = () => {
  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center gap-4 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
              <FileChartPie className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Summary</h1>
              <p className="text-sm text-slate-600">High-level summaries and project snapshots.</p>
            </div>
          </header>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Summary panels and analytics snapshots will be shown here.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Summary;
