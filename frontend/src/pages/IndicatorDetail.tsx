// src/pages/IndicatorDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { fetchTimeSeries } from '../api';
import LineChart from '../components/charts/LineChart';
import { ErrorCard, LoadingCard } from '../components/ui';
import { formatDate, formatUnit, getCategoryColor, getCategoryLabel } from '../utils/format';
import { useState } from 'react';

const PERIOD_OPTIONS = [
  { label: '1 oy', value: 30 },
  { label: '3 oy', value: 90 },
  { label: '6 oy', value: 180 },
  { label: '1 yil', value: 365 },
  { label: 'Barchasi', value: 3000 },
];

export default function IndicatorDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [limit, setLimit] = useState(365);

  const { data, isLoading, error } = useQuery(
    ['timeSeries', name, limit],
    () => fetchTimeSeries(name!, { limit }),
    { enabled: !!name }
  );

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingCard rows={5} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="btn-secondary mb-4">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>
        <ErrorCard message={`"${name}" ko'rsatkichi topilmadi.`} />
      </div>
    );
  }

  const { indicator, data: series } = data;
  const color = getCategoryColor(indicator.category);

  // Stats
  const values = series.map((p) => p.value);
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const change = latest && previous ? latest.value - previous.value : null;
  const changePercent = previous ? ((change! / previous.value) * 100) : null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const handleExport = () => {
    const csv = [
      'Sana,Qiymat',
      ...series.map(p => `${p.date},${p.value}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="btn-secondary">
        <ArrowLeft className="w-4 h-4" /> Orqaga
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: `${color}15`, color }}
              >
                {getCategoryLabel(indicator.category)}
              </span>
              {indicator.source && (
                <span className="text-xs text-slate-400">Manba: {indicator.source}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{indicator.display_name}</h1>
            {indicator.description && (
              <p className="text-slate-500 text-sm mt-2 max-w-xl">{indicator.description}</p>
            )}
          </div>

          <button onClick={handleExport} className="btn-secondary flex-shrink-0">
            <Download className="w-4 h-4" /> CSV yuklab olish
          </button>
        </div>

        {/* Latest value highlight */}
        {latest && (
          <div
            className="mt-6 pt-6 border-t border-slate-50 flex flex-col sm:flex-row sm:items-end gap-4"
          >
            <div>
              <div className="text-xs text-slate-400 mb-1">Oxirgi qiymat</div>
              <div className="text-4xl font-bold" style={{ color }}>
                {formatUnit(latest.value, indicator.unit)}
              </div>
            </div>
            {change !== null && (
              <div className={`flex items-center gap-1.5 text-sm font-medium pb-1 ${change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent?.toFixed(1)}%)
                <span className="text-slate-400 font-normal">oldingi davr bilan</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 pb-1 sm:ml-auto">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(latest.date)}
            </div>
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Minimum', value: formatUnit(min, indicator.unit) },
          { label: 'Maksimum', value: formatUnit(max, indicator.unit) },
          { label: "O'rtacha", value: formatUnit(avg, indicator.unit) },
          { label: "Ma'lumotlar soni", value: series.length.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="card py-4">
            <div className="text-xs text-slate-400 mb-1">{label}</div>
            <div className="text-base font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-slate-900">Vaqt qatori</h2>
          <div className="flex gap-1 bg-slate-50 rounded-lg p-1">
            {PERIOD_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setLimit(value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  limit === value
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <LineChart
          data={series}
          color={color}
          unit={indicator.unit}
          height={360}
          showGrid
          showDots={series.length < 50}
        />
      </div>

      {/* Data table */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Ma'lumotlar jadvali ({series.length} ta yozuv)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 text-xs font-medium text-slate-400 uppercase">Sana</th>
                <th className="text-right py-2 text-xs font-medium text-slate-400 uppercase">Qiymat</th>
              </tr>
            </thead>
            <tbody>
              {[...series].reverse().slice(0, 50).map((point) => (
                <tr key={point.date} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2.5 pr-4 text-slate-600">{formatDate(point.date)}</td>
                  <td className="py-2.5 text-right font-medium text-slate-900">
                    {formatUnit(point.value, indicator.unit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {series.length > 50 && (
            <p className="text-xs text-slate-400 mt-3 text-center">
              Faqat so'nggi 50 ta yozuv ko'rsatilmoqda. CSV export orqali barchasini yuklab oling.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
