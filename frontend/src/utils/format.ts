// src/utils/format.ts

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('uz-UZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
  });
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatCurrency(value: number, decimals = 0): string {
  return new Intl.NumberFormat('uz-UZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatUnit(value: number, unit: string): string {
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === 'UZS/USD' || unit === 'so\'m') return `${formatCurrency(value)} so'm`;
  if (unit === 'mln USD') return `$${formatNumber(value, 1)} mln`;
  return `${formatNumber(value)} ${unit}`;
}

export function getChangeColor(change: number): string {
  if (change > 0) return 'text-red-500';
  if (change < 0) return 'text-green-500';
  return 'text-gray-500';
}

export function getChangeBg(change: number): string {
  if (change > 0) return 'bg-red-50 text-red-700';
  if (change < 0) return 'bg-green-50 text-green-700';
  return 'bg-gray-50 text-gray-600';
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    inflation: 'Inflyatsiya',
    exchange_rate: 'Valyuta kursi',
    trade: 'Tashqi savdo',
    exports: 'Eksport',
    imports: 'Import',
  };
  return labels[category] || category;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    inflation: '#ef4444',
    exchange_rate: '#3b82f6',
    trade: '#8b5cf6',
    exports: '#10b981',
    imports: '#f59e0b',
  };
  return colors[category] || '#6b7280';
}
