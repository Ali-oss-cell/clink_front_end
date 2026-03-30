import * as React from 'react';
import { cn } from '../../lib/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClass: Record<BadgeVariant, string> = {
  default: 'tp-ui-badge--default',
  success: 'tp-ui-badge--success',
  warning: 'tp-ui-badge--warning',
  danger: 'tp-ui-badge--danger',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <span className={cn('tp-ui-badge', variantClass[variant], className)} {...props} />;
}
