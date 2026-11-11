import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowRight, BarChart3, Bot, CalendarDays, FileChartPie, FileText, FolderKanban, List } from 'lucide-react';

const icons = { Projects: FolderKanban, Analytics: BarChart3, Calendar: CalendarDays, Forms: FileText, List, Summary: FileChartPie, 'AI Assistant': Bot };

const PublicFeaturePage = ({ title }) => {
  const Icon = icons[title] || FolderKanban;

  return (
    <Layout publicView>
      <div className="mx-auto max-w-5xl space-y-8 p-5 sm:p-8">
        <div className="demo-banner">
          <span className="demo-dot" />
          Demo workspace · illustrative data only
        </div>
        <section className="hero-panel">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
            <Icon className="h-7 w-7" />
          </div>
          <p className="eyebrow mt-6">Jira Pro preview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}, without the busywork.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Explore the polished {title.toLowerCase()} experience with a safe preview of the workspace. Sign in to connect your own projects and data.</p>
          <Link to="/login" className="btn btn-primary mt-7 inline-flex items-center gap-2">Get started <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>
    </Layout>
  );
};

export default PublicFeaturePage;
