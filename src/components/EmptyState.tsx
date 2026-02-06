import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-concrete-800">
          <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-6 rounded-lg bg-yolk-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-yolk-600"
          >
            {action.label}
          </button>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
