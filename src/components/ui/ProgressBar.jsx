const ProgressBar = ({ label, value, total, color = 'progress-primary' }) => {
  const safeTotal = total || 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {value} / {safeTotal}
        </span>
      </div>
      <progress
        className={`progress ${color}`}
        value={safeTotal ? value : 0}
        max={safeTotal || 1}
        aria-label={`${label} progress`}
      />
    </div>
  );
};

export default ProgressBar;
