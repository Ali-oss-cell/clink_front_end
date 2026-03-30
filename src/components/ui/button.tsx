import * as React from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'default' | 'outline' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClass: Record<ButtonVariant, string> = {
  default: 'tp-ui-btn tp-ui-btn--default',
  outline: 'tp-ui-btn tp-ui-btn--outline',
  destructive: 'tp-ui-btn tp-ui-btn--destructive',
  ghost: 'tp-ui-btn tp-ui-btn--ghost',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'tp-ui-btn--sm',
  md: 'tp-ui-btn--md',
  lg: 'tp-ui-btn--lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(variantClass[variant], sizeClass[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
