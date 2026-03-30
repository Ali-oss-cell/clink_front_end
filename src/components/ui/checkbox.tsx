import * as React from 'react';
import { cn } from '../../lib/cn';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, type = 'checkbox', ...props }, ref) => {
    return <input ref={ref} type={type} className={cn('tp-ui-checkbox', className)} {...props} />;
  }
);

Checkbox.displayName = 'Checkbox';
