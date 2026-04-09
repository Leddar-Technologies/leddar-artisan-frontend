interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-900 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 border border-surface-500 rounded-xl bg-white/90 focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none transition-all ${
          error ? 'border-danger focus:ring-danger/30' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
