// src/pages/Dashboard.tsx
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { fetchLatestValues, fetchTimeSeries, triggerRefresh } from '../api';
import LineChart from '../components/charts/LineChart';
import { ErrorCard, LoadingCard, SectionHeader } from '../components/ui';
import { formatDate, formatUnit, getCategoryColor, getCategoryLabel } from '../utils/format';
import { useState } from 'react';

const FEATURED_INDICATORS = [
  { name: 'inflation_rate', label: 'Inflyatsiya darajasi' },
  { name: 'usd_uzs', label: 'USD/UZS kursi' },
  { name: 'trade_balance', label: 'Savdo balansi' },
];

function TrendIcon({ trend }: { trend: number }) {
  if (trend > 0.5) return <TrendingUp className="w-4 h-4 text-red-500" />;
  if (trend < -0.5) return <TrendingDown className="w-4 h-4 text-green-500" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

function MiniChart({ name, color }: { name: string; color: string }) {
  const { data } = useQuery(
    ['timeSeries', name, 'mini'],
    () => fetchTimeSeries(name, { limit: 24 }),
    { staleTime: 10 * 60 * 1000 }
  );
  if (!data?.data?.length) return <div className="h-16 skeleton rounded" />;
  return (
    <LineChart
      data={data.data}
      color={color}
      height={80}
      showGrid={false}
      showDots={false}
      unit={data.indicator.unit}
    />
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: latest,
    isLoading,
    error,
    refetch,
  } = useQuery('latest', fetchLatestValues, {
    refetchInterval: 5 * 60 * 1000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerRefresh();
      await refetch();
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <LoadingCard key={i} rows={2} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorCard message="Backend serverga ulanib bo'lmadi. Iltimos, backendni ishga tushiring." />
      </div>
    );
  }

  const items = latest?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 rounded-3xl px-8 py-10 text-white">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #60a5fa 0%, transparent 50%), radial-gradient(circle at 80% 50%, #818cf8 0%, transparent 50%)'
        }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🇺🇿</span>
            <span className="badge bg-white/20 text-white text-xs">Real vaqt</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
            O'zbekiston Iqtisodiy Monitor
          </h1>
          <p className="text-blue-200 max-w-xl text-base mb-6">
            Inflyatsiya, valyuta kursi, eksport-import va boshqa ko'rsatkichlar real vaqtda
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all border border-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Ma'lumotlarni yangilash
            </button>
            {latest?.fetched_at && (
              <div className="flex items-center gap-1.5 text-blue-200 text-xs">
                <Clock className="w-3.5 h-3.5" />
                Oxirgi yangilanish: {formatDate(latest.fetched_at)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Latest values grid */}
      <div>
        <SectionHeader
          title="Barcha ko'rsatkichlar"
          subtitle={`${items.length} ta ko'rsatkich kuzatilmoqda`}
        />

        {items.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-slate-500 text-sm">
              Hozircha ma'lumotlar yo'q. "Ma'lumotlarni yangilash" tugmasini bosing.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const color = getCategoryColor(item.category);
              return (
                <div
                  key={item.indicator_id}
                  className="card cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                  onClick={() => navigate(`/indicator/${item.name}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                        {getCategoryLabel(item.category)}
                      </div>
                      <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                        {item.display_name}
                      </div>
                    </div>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    </div>
                  </div>

                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {formatUnit(item.value, item.unit)}
                  </div>

                  <div className="text-xs text-slate-400">
                    {formatDate(item.date)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Featured charts */}
      {items.length > 0 && (
        <div>
          <SectionHeader
            title="Asosiy ko'rsatkichlar"
            subtitle="So'nggi 2 yillik dinamika"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {FEATURED_INDICATORS.map(({ name, label }) => {
              const item = items.find((i) => i.name === name);
              const color = item ? getCategoryColor(item.category) : '#3b82f6';
              return (
                <div
                  key={name}
                  className="card cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate(`/indicator/${name}`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{label}</div>
                      {item && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          Oxirgi qiymat: {formatUnit(item.value, item.unit)}
                        </div>
                      )}
                    </div>
                    <div
                      className="text-xs font-medium px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      Batafsil →
                    </div>
                  </div>
                  <MiniChart name={name} color={color} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
