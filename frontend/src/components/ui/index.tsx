// src/components/ui/index.tsx
import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

// ─── Loading Spinner ───────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <Loader2 className={`${sizes[size]} animate-spin text-blue-600`} />;
}

// ─── Loading State ─────────────────────────────────────────────
export function LoadingCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-slate-100 rounded mb-3 last:mb-0" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  );
}

// ─── Error State ───────────────────────────────────────────────
export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="card border-red-100 bg-red-50/50">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-sm font-medium text-red-800">Xato yuz berdi</div>
          <div className="text-xs text-red-600 mt-1">{message}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────
export function EmptyState({ message = "Ma'lumot topilmadi" }: { message?: string }) {
  return (
    <div className="card text-center py-12">
      <div className="text-4xl mb-3">📊</div>
      <div className="text-slate-500 text-sm">{message}</div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, subtitle, trend, icon, color = '#3b82f6', onClick }: StatCardProps) {
  return (
    <div
      className={`card ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</div>
        {icon && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${trend >= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
      </div>
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  color?: string;
}

export function Badge({ children, color }: BadgeProps) {
  return (
    <span
      className="badge"
      style={
        color
          ? { backgroundColor: `${color}15`, color }
          : { backgroundColor: '#f1f5f9', color: '#64748b' }
      }
    >
      {children}
    </span>
  );
}
