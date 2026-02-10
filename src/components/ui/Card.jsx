const Card = ({ children, className = '', variant = 'default', padding = 'p-6' }) => {
  const variants = {
    default: 'bg-white border border-slate-200/80 shadow-sm rounded-2xl',
    elevated: 'bg-white border border-slate-200/70 shadow-md rounded-2xl',
    subtle: 'bg-slate-50 border border-slate-200/80 rounded-2xl',
  };

  return (
    <div className={`${variants[variant]} ${padding} ${className}`.trim()}>
      {children}
    </div>
  );
};

export default Card;
