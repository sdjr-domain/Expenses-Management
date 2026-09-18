import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-slate-700 ml-1">{label}</label>}
      <input
        className={`px-4 py-2 rounded-lg border transition-all duration-200 outline-none focus:ring-2 focus:ring-accent/20 ${
          error
            ? 'border-rose-500 focus:border-rose-500'
            : 'border-slate-200 focus:border-accent'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 ml-1">{error}</span>}
    </div>
  );
};
