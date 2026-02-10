import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-slate-600">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </motion.div>
  );
};

export default PageHeader;
