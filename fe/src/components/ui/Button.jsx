const variants = {
  primary: 'bg-[#2563EB] text-white hover:bg-blue-700 focus:ring-[#2563EB]',
  secondary: 'bg-white text-[#1E293B] border border-slate-200 hover:bg-slate-50 focus:ring-slate-300',
  danger: 'bg-[#EF4444] text-white hover:bg-red-600 focus:ring-red-500',
  ghost: 'bg-transparent text-[#64748B] hover:bg-slate-100 focus:ring-slate-300',
  teal: 'bg-[#14B8A6] text-white hover:bg-teal-600 focus:ring-teal-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
