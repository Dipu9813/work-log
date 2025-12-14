import * as React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, ...props }, ref) => (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        ref={ref}
        className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        {...props}
      />
      {label && <span className="text-base text-gray-900">{label}</span>}
    </label>
  )
);
Checkbox.displayName = 'Checkbox';
