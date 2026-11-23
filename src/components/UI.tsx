import React, { useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, X, XCircle } from 'lucide-react';
import type { AppointmentStatus } from '../types/bookly';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap shrink-0 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none';

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-9 px-3.5 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-6 text-sm',
  };

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-[#4665E8] text-white hover:bg-[#3754D4] active:scale-[0.99]',
    secondary: 'bg-[#17191F] text-white hover:bg-[#2A2D37] active:scale-[0.99]',
    outline:
      'bg-white text-[#17191F] border border-[#17191F]/15 hover:border-[#17191F]/35 hover:bg-[#F8F7F3]',
    ghost: 'bg-transparent text-[#17191F] hover:bg-[#17191F]/5',
    danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatusIndicator({ status }: { status: AppointmentStatus }) {
  const config: Record<
    AppointmentStatus,
    { label: string; textClass: string; icon: React.ReactNode }
  > = {
    confirmed: {
      label: 'Confirmed',
      textClass: 'text-[#4665E8]',
      icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
    },
    pending: {
      label: 'Pending',
      textClass: 'text-[#B45309]',
      icon: <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
    },
    completed: {
      label: 'Completed',
      textClass: 'text-[#15803D]',
      icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
    },
    cancelled: {
      label: 'Cancelled',
      textClass: 'text-[#858A96]',
      icon: <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
    },
  };

  const current = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${current.textClass}`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white border border-[#17191F]/10 rounded-xl">
      <div className="w-10 h-10 rounded-lg bg-[#E8EDFF] text-[#4665E8] flex items-center justify-center mb-4">
        <AlertCircle className="w-5 h-5" aria-hidden="true" />
      </div>
      <h3 className="font-display text-base font-semibold text-[#17191F]">{title}</h3>
      <p className="text-sm text-[#858A96] max-w-sm mt-1.5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading workspace">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-white border border-[#17191F]/8 p-5">
            <div className="h-3 w-24 bg-[#17191F]/10 rounded" />
            <div className="h-7 w-28 bg-[#17191F]/10 rounded mt-4" />
          </div>
        ))}
      </div>
      <div className="h-72 rounded-xl bg-white border border-[#17191F]/8 p-6" />
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191F]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg bg-white border border-[#17191F]/12 rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#17191F]/10">
          <div>
            <h2 id="modal-title" className="font-display text-lg font-semibold text-[#17191F]">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-[#858A96] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#858A96] hover:text-[#17191F] hover:bg-[#F8F7F3] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#17191F]/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md bg-white border-l border-[#17191F]/12 h-full flex flex-col shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#17191F]/10">
          <div>
            <h2 id="drawer-title" className="font-display text-lg font-semibold text-[#17191F]">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-[#858A96] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#858A96] hover:text-[#17191F] hover:bg-[#F8F7F3] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
